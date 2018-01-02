var engin = {};
var belowPlayerGroup;
var abovePlayerGroup;
var appCacheFiles = [];
var appCacheCurrentFile = 0;
var fontSettings = {
	font: "10px Russo One",
	fill: "#000000"
};

function fixURL(url) {
	return "//" + String(url).replace(/^http(s)?:\/{2}/i, "");
}

//engin events
function startEngin(cb) {
	engin = new Phaser.Game(700, 700, page.menu.settings.graphics.renderMode(), "game", {
		preload: preload,
		create: _.compose(create, cb || function() {}),
		update: update,
		render: render
	});
}
function create() {
	engin.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

	//set up
	engin.time.advancedTiming = true;
	engin.physics.startSystem(Phaser.Physics.ARCADE);

	//set up the settings
	engin.sound.mute = page.menu.settings.sound.mute();
	engin.sound.volume = page.menu.settings.sound.volume();

	//sound
	sound.background.start();

	// bind the keys
	keyBindings.bindKeys();

	engin.plugins.add(Phaser.Plugin.Debug);
	$(".pdebug").hide();

	belowPlayerGroup = engin.add.group(engin.world, "belowPlayer");
	abovePlayerGroup = engin.add.group(engin.world, "abovePlayer");

	//start modals
	players.init();
	map.init();
	objects.init();

	//resize the engin to fit the screen
	$(window).trigger("resize");
}
function update() {
	players.step();
	objects.step();
}
function render() {
	if (page.menu.settings.graphics.debug()) {
		for (var i = players.players.length - 1; i >= 0; i--) {
			engin.debug.body(players.players[i].sprite);
		}
		if (players.player) {
			engin.debug.body(players.player.sprite);
		}

		var fpsColor =
			"rgb(" +
			Math.round(engin.time.fps > 30 ? 255 - engin.time.fps / 60 * 255 : 255) +
			"," +
			Math.round(engin.time.fps / 30) * 255 +
			",0)";
		engin.debug.text(
			"fps: ( " + engin.time.fpsMax + " < " + engin.time.fps + " > " + engin.time.fpsMin + " )",
			16,
			16,
			fpsColor,
			fontSettings
		);
	}
}
function login() {
	//fires when we login to a server
	page.connect.login.loggedIn(true);
	map.loadLayers();
	map.loadedMapID = -1; //reset the loaded map id so when the user data loads it will know to load the map
	loadShardData(function() {
		//turn the keyboard on
		keyBindings.enable("game");
	});
}
function logout() {
	//fires when server disconnects
	page.chat.removeAllChanels();
	page.connect.login.loggedIn(false);
	keyBindings.enabled("none");
	map.removeAllChunks();
	objects.removeAllObjects();
	$("#connect-modal").foundation("reveal", "open");
}

$(document).ready(function() {
	//create the DB
	db.init(function() {
		//load the settigns
		page.init(function() {
			ko.applyBindings(page);

			//load all the settings
			page.settings.init(function() {
				server.init();
			});
		});
	});

	$(document).foundation({
		reveal: {
			animation: "fade",
			close_on_esc: false,
			close_on_background_click: false
		}
	});

	//open the loading screen
	page.loading.setUpAppCache();

	//---------------------background----------------------

	$("html,body").on("contextmenu", function() {
		return false;
	});

	$(".no-action").submit(function(event) {
		/* Act on the event */
		event.preventDefault();
	});
	$("ht, body").on("click", "a[href=#]", function(event) {
		/* Act on the event */
		event.preventDefault();
	});

	$(window).on("mousemove", function(event) {
		if (engin.isBooted) {
			engin.input.mousePointer.realPageX = event.pageX;
			engin.input.mousePointer.realPageY = event.pageY;
		}
	});

	$("*[data-keyboard-enable]").click(function() {
		keyBindings.enable($(this).data("keyboard-enable"));
	});

	$(".tabs>dd:first-child").addClass("active");
	$(".tabs-content>.content:first-child").addClass("active");

	// -----------------------app-------------------------

	// mouse keyboard input
	$("body")
		.mousedown(function(event) {
			if (engin.isBooted) {
				engin.input.keyboard.processKeyDown({ keyCode: event.which - 1 });
			}
		})
		.mouseup(function(event) {
			if (engin.isBooted) {
				engin.input.keyboard.processKeyUp({ keyCode: event.which - 1 });
			}
		});

	//keybindings
	$("body").keydown(function(event) {
		if ($("#keybinding").css("display") == "block") {
			page.menu.settings.keyBindings.bind(event);
		}
	});
	$("body").mousedown(function(event) {
		if ($("#keybinding").css("display") == "block") {
			page.menu.settings.keyBindings.bind(event);
		}
	});

	$("#chat, #chat *, #show-chat, #show-chat *").click(function(event) {
		page.chat.open(true);
	});
	$("*:not(html, body, #chat, #chat *, #show-chat, #show-chat *)").click(function(event) {
		page.chat.open(false);
	});

	// menu
	$("#menu .close-reveal-modal").click(function(event) {
		keyBindings.enable("game");
	});

	$("html, body").on("click", ".trigger-resize", function(event) {
		$(window).trigger("resize");
	});

	//resize
	$(window).resize(function(event) {
		if (engin.isBooted) {
			engin.scale.setGameSize(engin.height * window.innerWidth / window.innerHeight, engin.height);
			map.scaleWorld();
		}

		//resize class
		$(".resize").each(function(i, el) {
			$(el).height(
				$(el)
					.parent()
					.innerHeight() - $(el).position().top
			);
		});
	});
});

_errors = 0;
window.onerror = function(errorMsg, url, lineNumber, column, stack) {
	_errors++;
	if (server && _errors < 20) {
		if (server.connected) {
			server.socket.emit("logError", { message: errorMsg, file: url, line: lineNumber, stack: stack.stack });
		}
	}
	return false;
};

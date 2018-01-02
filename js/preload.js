loadedData = {};
function loadData(cb) {
	cb = _.after(3, cb);

	//tilesets.json
	$.ajax({
		url: "data/tilesets.json",
		type: "GET",
		dataType: "json"
	})
		.done(function(data) {
			loadedData.tilesets = data;
			map.tilesets = data;

			cb();
		})
		.fail(function() {
			throw new Error("failed to load tilesets json");
		});

	//sound.json
	$.ajax({
		url: "data/sound.json",
		type: "GET",
		dataType: "json"
	})
		.done(function(data) {
			sound.json = data;

			cb();
		})
		.fail(function() {
			throw new Error("failed to load sound json");
		});

	//playerImages.json
	$.ajax({
		url: "data/playerImages.json",
		type: "GET",
		dataType: "json"
	})
		.done(function(data) {
			loadedData.playerImages = data;

			cb();
		})
		.fail(function() {
			throw new Error("failed to load playerImages json");
		});
}
function loadShardData(cb) {
	cb = _.after(4, _.partial(loadServerImages, cb));
	url = fixURL(server.url + "/api/data/");

	$.ajax({
		url: url + "itemProfiles",
		type: "GET",
		dataType: "json"
	})
		.done(function(data) {
			//update the pages items
			json = fn.idArray(data, "name");
			page.items(json);
			server.data.items = json;

			cb();
		})
		.fail(function() {
			throw new Error("failed to load items json");
		});

	$.ajax({
		url: url + "damageProfiles",
		type: "GET",
		dataType: "json"
	})
		.done(function(data) {
			//nothing to do with it yet
			cb();
		})
		.fail(function() {
			throw new Error("failed to load damageProfiles json");
		});

	$.ajax({
		url: url + "resourceProfiles",
		type: "GET",
		dataType: "json"
	})
		.done(function(data) {
			server.data.resources = fn.idArray(data, "time");
			cb();
		})
		.fail(function() {
			throw new Error("failed to load resourceProfiles json");
		});

	$.ajax({
		url: url + "miningProfiles",
		type: "GET",
		dataType: "json"
	})
		.done(function(data) {
			//nothing to do with it yet
			cb();
		})
		.fail(function() {
			throw new Error("failed to load miningProfiles json");
		});
}

function preload() {
	//engin settings
	engin.stage.disableVisibilityChange = true;

	//image
	engin.load.image("blank", "imgs/other/blank.png");
	engin.load.image("progress", "imgs/other/progress.png");
	engin.load.image("map-collision", "imgs/other/map-collision.png");

	//objects
	engin.load.image("object-door", "imgs/other/object-door.png");

	//player
	for (var i = 0; i < loadedData.playerImages.length; i++) {
		engin.load.spritesheet("player/" + (i + 1), loadedData.playerImages[i], 32, 48);
	}

	//load the sound
	for (var k in sound.json.background) {
		for (var i = 0; i < sound.json.background[k].length; i++) {
			s = sound.json.background[k][i];
			engin.load.audio(s.url, "snd/background/" + s.url, true);
		}
	}

	// tilesets
	for (var i = 0; i < loadedData.tilesets.length; i++) {
		engin.load.image(loadedData.tilesets[i].name, loadedData.tilesets[i].url);
	}

	engin.load.onLoadStart.addOnce(function() {
		$("#loading").fadeIn();
	});
	engin.load.onFileComplete.add(function() {
		$("#loading .progress>span").css("width", engin.load.progressFloat + "%");
	});
	engin.load.onLoadComplete.addOnce(function() {
		engin.load.onFileComplete.removeAll();
		$("#loading").fadeOut();
	});
}

function loadServerImages(cb) {
	// a = server.data.items;
	// for (var i in a) {
	// 	if (String(i).indexOf('_extend') === -1 && a[i].img.length) {
	// 		engin.load.image("imgs/item/" + i, a[i].img);
	// 	}
	// }

	engin.load.onLoadStart.addOnce(function() {
		// $('#loading').fadeIn();
	});
	engin.load.onFileComplete.add(function() {
		$("#loading .progress>span").css("width", engin.load.progressFloat + "%");
	});
	engin.load.onLoadComplete.addOnce(function() {
		engin.load.onFileComplete.removeAll();
		// $('#loading').fadeOut();
		if (cb) cb();
	});

	engin.load.start();
}

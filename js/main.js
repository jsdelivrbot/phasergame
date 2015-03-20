var engin = {};
var belowPlayerGroup;
var abovePlayerGroup;
var appCacheFiles = [];
var appCacheCurrentFile = 0;
var keyboardMap = ["MOUSE LEFT","MOUSE WHEEL","MOUSE RIGHT","CANCEL","","","HELP","","BACK_SPACE","TAB","","","CLEAR","ENTER","RETURN","","SHIFT","CONTROL","ALT","PAUSE","CAPS_LOCK","KANA","EISU","JUNJA","FINAL","HANJA","","ESCAPE","CONVERT","NONCONVERT","ACCEPT","MODECHANGE","SPACE","PAGE_UP","PAGE_DOWN","END","HOME","LEFT","UP","RIGHT","DOWN","SELECT","PRINT","EXECUTE","PRINTSCREEN","INSERT","DELETE","","0","1","2","3","4","5","6","7","8","9","COLON","SEMICOLON","LESS_THAN","EQUALS","GREATER_THAN","QUESTION_MARK","AT","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","WIN","","CONTEXT_MENU","","SLEEP","NUMPAD0","NUMPAD1","NUMPAD2","NUMPAD3","NUMPAD4","NUMPAD5","NUMPAD6","NUMPAD7","NUMPAD8","NUMPAD9","MULTIPLY","ADD","SEPARATOR","SUBTRACT","DECIMAL","DIVIDE","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","F13","F14","F15","F16","F17","F18","F19","F20","F21","F22","F23","F24","","","","","","","","","NUM_LOCK","SCROLL_LOCK","WIN_OEM_FJ_JISHO","WIN_OEM_FJ_MASSHOU","WIN_OEM_FJ_TOUROKU","WIN_OEM_FJ_LOYA","WIN_OEM_FJ_ROYA","","","","","","","","","","CIRCUMFLEX","EXCLAMATION","DOUBLE_QUOTE","HASH","DOLLAR","PERCENT","AMPERSAND","UNDERSCORE","OPEN_PAREN","CLOSE_PAREN","ASTERISK","PLUS","PIPE","HYPHEN_MINUS","OPEN_CURLY_BRACKET","CLOSE_CURLY_BRACKET","TILDE","","","","","VOLUME_MUTE","VOLUME_DOWN","VOLUME_UP","","","","","COMMA","","PERIOD","SLASH","BACK_QUOTE","","","","","","","","","","","","","","","","","","","","","","","","","","","OPEN_BRACKET","BACK_SLASH","CLOSE_BRACKET","QUOTE","","META","ALTGR","","WIN_ICO_HELP","WIN_ICO_00","","WIN_ICO_CLEAR","","","WIN_OEM_RESET","WIN_OEM_JUMP","WIN_OEM_PA1","WIN_OEM_PA2","WIN_OEM_PA3","WIN_OEM_WSCTRL","WIN_OEM_CUSEL","WIN_OEM_ATTN","WIN_OEM_FINISH","WIN_OEM_COPY","WIN_OEM_AUTO","WIN_OEM_ENLW","WIN_OEM_BACKTAB","ATTN","CRSEL","EXSEL","EREOF","PLAY","ZOOM","","PA1","WIN_OEM_CLEAR",""];
var fontSettings = {
	font: "10px Russo One", 
	fill: "#000000",
}

//engin events
function startEngin(cb){
	engin = new Phaser.Game(700,700,page.menu.settings.graphics.renderMode(),'game', { 
		preload: preload, 
		create: _.compose(create,cb || function(){}),
		update: update, 
		render: render
	})
}
function create(){
	engin.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	
	//set up
	engin.time.advancedTiming = true
	engin.physics.startSystem(Phaser.Physics.ARCADE);

	//set up the settings
	engin.sound.mute = page.menu.settings.sound.mute();
	engin.sound.volume = page.menu.settings.sound.volume();

	//sound
	sound.background.start();

	// bind the keys
	keyBindings.bindKeys()

	engin.plugins.add(Phaser.Plugin.Debug);
	$('.pdebug').hide();

	belowPlayerGroup = engin.add.group(engin.world,'belowPlayer');
	abovePlayerGroup = engin.add.group(engin.world,'abovePlayer');

	//start modals
	players.init();
	map.init();
	objects.init();

	//resize the engin to fit the screen
	$(window).trigger('resize')
}
function update(){
	players.step();
	objects.step();
}
function render(){

	if(page.menu.settings.graphics.debug()){
		for (var i = players.players.length - 1; i >= 0; i--) {
			engin.debug.body(players.players[i].sprite);
		};
		if(players.player){
			engin.debug.body(players.player.sprite);
		}

		var fpsColor = 'rgb('+Math.round((engin.time.fps > 30)? (255-(engin.time.fps/60)*255) : 255)+','+Math.round(engin.time.fps/30)*255+',0)';
		engin.debug.text('fps: ( '+engin.time.fpsMax+' < '+engin.time.fps+' > '+engin.time.fpsMin+' )',16,16,fpsColor,fontSettings);
	}
}
function login(){ //fires when we login to a server
	map.loadLayers();
	map.loadedMapID = -1; //reset the loaded map id so when the user data loads it will know to load the map
	loadShardData(function(){
		$("#login-modal").foundation('reveal','close');

		//turn the keyboard on
		keyBindings.enable('game')
	})
}
function logout(){ //fires when server disconnects
	keyBindings.enabled('none');
	map.removeAllChunks();
	objects.removeAllObjects();
	$('#connect-modal').foundation('reveal','open');
}

$(document).ready(function() {
	console.log('-----DOC READY-----')

	//create the DB
	db.init(function(){
		//load the settigns
		page.init(function(){
			ko.applyBindings(page);
			
			//load all the settings
			page.settings.init(function(){
				server.init();
			});
		});
	})

	$(document).foundation({
		reveal:{
            animation: 'fade',
            close_on_esc: false,
            close_on_background_click: false
		}
	});

	//open the loading screen
	page.loading.setUpAppCache()

	//---------------------background----------------------

	$('html,body').on('contextmenu',function(){
		return false;
	})

	$(".no-action").submit(function(event) {
		/* Act on the event */
		event.preventDefault()
	});
	$("ht, body").on('click','a[href=#]',function(event) {
		/* Act on the event */
		event.preventDefault()
	});

	$(window).on("mousemove", function(event){
		if(engin.isBooted){
			engin.input.mousePointer.realPageX = event.pageX;
			engin.input.mousePointer.realPageY = event.pageY;
		}
	});

	$('*[data-keyboard-enable]').click(function(){
		keyBindings.enable($(this).data('keyboard-enable'));
	})

	$(".tabs>dd:first-child").addClass('active')
	$(".tabs-content>.content:first-child").addClass('active')

	// -----------------------app-------------------------

	// mouse keyboard input
	$('body').mousedown(function(event) {
		if(engin.isBooted){
			engin.input.keyboard.processKeyDown({keyCode: event.which - 1})
		}
	}).mouseup(function(event) {
		if(engin.isBooted){
			engin.input.keyboard.processKeyUp({keyCode: event.which - 1})
		}
	});

	//keybindings
	$('body').keydown(function(event) {
		if($("#keybinding").css('display') == 'block'){
			page.menu.settings.keyBindings.bind(event)
		}
	});
	$('body').mousedown(function(event) {
		if($("#keybinding").css('display') == 'block'){
			page.menu.settings.keyBindings.bind(event)
		}
	});

	$("#chat, #chat *").click(function(event) {
		/* Act on the event */
		$("#chat").addClass('out')
	})
	$(':not(#chat, #chat *)').click(function(event) {
		/* Act on the event */
		if(!$("#chat").is(":hover")){
			$("#chat").removeClass('out')
			$("#chat .off-canvas-wrap").removeClass('move-right')
			$("#chat .off-canvas-wrap").removeClass('move-left')
		}
	});

	// menu
	$("#menu .close-reveal-modal").click(function(event) {
		keyBindings.enable('game')
	});

	$('html, body').on('click', '.trigger-resize', function(event) {
		$(window).trigger('resize');
	});

	//resize
	$(window).resize(function(event) {
		if(engin.isBooted){
			engin.scale.setGameSize(engin.height*window.innerWidth/window.innerHeight,engin.height);
			map.scaleWorld();
		}

		//resize class
		$(".resize").each(function(i,el){
			$(el).height($(el).parent().innerHeight() - $(el).position().top);
		});
	});
});

_errors = 0;
window.onerror = function (errorMsg, url, lineNumber, column, stack) {
	_errors++;
	if(server && _errors < 20){
		if(server.connected){
			server.socket.emit('logError',{message: errorMsg, file: url, line: lineNumber, stack: stack.stack});
		}
	}
	return false;
}
var engin = {};
var appCacheFiles = [];
var appCacheCurrentFile = 0;
var keyboardMap = ["MOUSE LEFT","MOUSE WHEEL","MOUSE RIGHT","CANCEL","","","HELP","","BACK_SPACE","TAB","","","CLEAR","ENTER","RETURN","","SHIFT","CONTROL","ALT","PAUSE","CAPS_LOCK","KANA","EISU","JUNJA","FINAL","HANJA","","ESCAPE","CONVERT","NONCONVERT","ACCEPT","MODECHANGE","SPACE","PAGE_UP","PAGE_DOWN","END","HOME","LEFT","UP","RIGHT","DOWN","SELECT","PRINT","EXECUTE","PRINTSCREEN","INSERT","DELETE","","0","1","2","3","4","5","6","7","8","9","COLON","SEMICOLON","LESS_THAN","EQUALS","GREATER_THAN","QUESTION_MARK","AT","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","WIN","","CONTEXT_MENU","","SLEEP","NUMPAD0","NUMPAD1","NUMPAD2","NUMPAD3","NUMPAD4","NUMPAD5","NUMPAD6","NUMPAD7","NUMPAD8","NUMPAD9","MULTIPLY","ADD","SEPARATOR","SUBTRACT","DECIMAL","DIVIDE","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","F13","F14","F15","F16","F17","F18","F19","F20","F21","F22","F23","F24","","","","","","","","","NUM_LOCK","SCROLL_LOCK","WIN_OEM_FJ_JISHO","WIN_OEM_FJ_MASSHOU","WIN_OEM_FJ_TOUROKU","WIN_OEM_FJ_LOYA","WIN_OEM_FJ_ROYA","","","","","","","","","","CIRCUMFLEX","EXCLAMATION","DOUBLE_QUOTE","HASH","DOLLAR","PERCENT","AMPERSAND","UNDERSCORE","OPEN_PAREN","CLOSE_PAREN","ASTERISK","PLUS","PIPE","HYPHEN_MINUS","OPEN_CURLY_BRACKET","CLOSE_CURLY_BRACKET","TILDE","","","","","VOLUME_MUTE","VOLUME_DOWN","VOLUME_UP","","","","","COMMA","","PERIOD","SLASH","BACK_QUOTE","","","","","","","","","","","","","","","","","","","","","","","","","","","OPEN_BRACKET","BACK_SLASH","CLOSE_BRACKET","QUOTE","","META","ALTGR","","WIN_ICO_HELP","WIN_ICO_00","","WIN_ICO_CLEAR","","","WIN_OEM_RESET","WIN_OEM_JUMP","WIN_OEM_PA1","WIN_OEM_PA2","WIN_OEM_PA3","WIN_OEM_WSCTRL","WIN_OEM_CUSEL","WIN_OEM_ATTN","WIN_OEM_FINISH","WIN_OEM_COPY","WIN_OEM_AUTO","WIN_OEM_ENLW","WIN_OEM_BACKTAB","ATTN","CRSEL","EXSEL","EREOF","PLAY","ZOOM","","PA1","WIN_OEM_CLEAR",""];
var loginCodes = [
	{
		message: 'success',
		class: 'success'
	},
	{
		message: 'Wrong Email or Password',
		class: 'warning'
	},
	{
		message: 'User Already Loged on',
		class: 'info'
	},
	{
		message: 'User Banned',
		class: 'alert'
	},
	{
		message: 'Cant connect to server',
		class: 'alert'
	},
	{
		message: 'Internal Error',
		class: 'alert'
	}
];

$(document).ready(function() {
	console.log('-----DOC READY-----')

	//create the DB
	db.init(function(){
		//load the settigns
		page.init(function(){
			ko.applyBindings(page);
			
			//load all the settings
			page.settings.loadAll(function(){
				$(window).on('beforeunload',page.settings.unload.bind(page.settings));
				//start the save loop since we have loaded every thing
				page.settings.saveLoop(0);
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
			engin.scale.scaleMode = 2;
			engin.scale.setMaximum()
			engin.scale.refresh()
		}

		//resize class
		$(".resize").each(function(i,el){
			$(el).height($(el).parent().innerHeight() - $(el).position().top);
		});
	});
});
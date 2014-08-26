var game = null;
var engin = null;
// var socket = null;
var server = null

function create(){
	//set up
	engin.time.advancedTiming = true
	engin.physics.startSystem(Phaser.Physics.ARCADE);

	//resize the engin to fit the screen
	$(window).trigger('resize')
}

function update(){
	if(game){
		game.update()
	}
}

function render(){
	if(game){
		game.engin.debug.text('fps: '+game.engin.time.fps,32,32)
	}
}

$(document).ready(function() {
	
	//----------------------first--------------------

	//aply the bindings onto the settings ko
	ko.applyBindings(settings,$('#settings-window').get(0));

	//start the engin / server
	engin = new Phaser.Game(800,600,settings.graphics.renderMode(),'game', { preload: preload, create: create, update: update, render: render},false,false)
	server = new Server()

	//---------------------background----------------------

	//dialog
	$(".dialog").dialog({
		draggable: false,
		resizable: false,
		autoOpen: false,
		modal: true,
		width: window.innerWidth - 100,
		height: window.innerHeight - 100
	})

	//popups
	$('.popup').each(function(index){
		$(this).dialog({
			title: $(this).data('title'),
			resizable: false,
			autoOpen: false,
			modal: true
		})
	})

	//tooltips
	$(".tool-tip").tooltip({
		content: $(this).data('tool-tip')
	})

	//select
	$('select').selectmenu({
		width:200,
		change: function(event,ui){
			$(event.target).trigger('change')
		}
	});

	//buttons
	$(".button").button()

	$(".tabs").tabs()


	//---------------------app--------------------
	
	//menu tabs
    $( "#menu-tabs" ).addClass( "ui-tabs-vertical ui-helper-clearfix" );
    $( "#menu-tabs>ul>li" ).removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );
	
	//progressbar
	$('#progress-bar').progressbar({
		max: 100,
      	value: false,
		change: function() {
			$('#progress-bar .progress-label').text( Math.ceil($('#progress-bar').progressbar( "value" )) + "%" );
		},
		complete: function() {
			$('#progress-bar .progress-label').text("Complete!");
		}
	})

	//menu
	$('#menu').dialog("option",{
		title: "Menu"
	})
	//settings
	$("#settings-save").click(function(event) {
	 	$('#menu').dialog("close"); 
	 	localStorage.setItem('settings',ko.mapping.toJSON(settings))
	 	$("#reload-popup").dialog('open')
	});

	//popups
	$('#reload-popup').dialog({
		title: 'Warning',
		resizable: false,
		autoOpen: false,
		modal: true,
		buttons:[
			{
				text: 'Not now',
				click: function() 
				{
				 	$(this).dialog("close"); 
				}
			},
			{
				text: 'reload',
				click: function() 
				{
				 	location.reload()
				} 
			}
		]
	})

	$("#connect").dialog({
		title: 'connect',
		resizable: false,
		autoOpen: false,
		modal: true,
		buttons:[
			{
				text: 'Connect',
				click: function() 
				{
					// socket = new Socket($("#server-ip").val())
					server.connect($("#server-ip").val(),function(){
						$("#connect").dialog('close')
						$("#login").dialog('open')
					},function(){
						$("#connect").dialog('open')
						$("#login").dialog('close')
					})
				} 
			}
		]
	})

	$("#login").dialog({
		title: 'Login',
		resizable: false,
		autoOpen: false,
		modal: true,
		buttons:[
			{
				text: 'Login',
				click: function() 
				{
				 	// socket.emit('login',{email:$('#login-email').val(),password:$("#login-password").val()})
				 	server.login($('#login-email').val(),$("#login-password").val(),function(data){
						if(data == false){
							console.log('failed')
						}
						else{
							console.log('logged in')
							$("#login").dialog('close')

							//start the game
							game = new Game(engin,server)
						}
				 	})
				} 
			}
		]
	})

	//buttons
	$('#menu-button').button('option',{
		text: false,
		icons: {primary: "ui-icon-gear"}
	}).click(function(event) {
		$('#menu').dialog('open')
	});

	//resize
	$(window).resize(function(event) {
		$("#menu").dialog({
			width: window.innerWidth - 100,
			height: window.innerHeight - 100
		})

		engin.scale.scaleMode = 2;
		engin.scale.setMaximum()
		engin.scale.refresh()
	});
});

//temp
// function resizeEngin() {
// 	var height = $(window).height();
// 	var width = $(window).width();
		
// 	engin.width = width;
// 	engin.height = height;
// 	engin.stage.bounds.width = width;
// 	engin.stage.bounds.height = height;
// 	engin.camera.setSize(width,height)
		
// 	if (engin.renderType === Phaser.WEBGL)
// 	{
// 		engin.renderer.resize(width, height);
// 	}
// }
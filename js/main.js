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
		game.step()
	}
}

function render(){
	if(game){
		game.engin.debug.text('fps: '+game.engin.time.fps,32,32)
	}
}

$(document).ready(function() {
	ko.applyBindings(page)
	$(document).foundation();
	//start the engin / server
	engin = new Phaser.Game(800,600,'auto','game', { preload: preload, create: create, update: update, render: render},false,false)
	server = new Server()

	//---------------------background----------------------

	$(".no-action").submit(function(event) {
		/* Act on the event */
		event.preventDefault()
	});
	$("ht, body").on('click','a[href=#]',function(event) {
		/* Act on the event */
		event.preventDefault()
	});

	// -----------------------app-------------------------

	$("#chat-send").submit(function(event) {
		/* Act on the event */
		if($("#chat-message").val().length){
			server.out.chat.data({
				type: 'message',
				chanel: page.chat.activeChanel.id(),
				message: $("#chat-message").val()
			})
			$("#chat-message").val('')
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

	$("#chat-chanels").on('click','a',function(event){
		page.chat.open($(this).data('id'))
		$("#chat .off-canvas-wrap").removeClass('move-right')
		$("#chat .off-canvas-wrap").removeClass('move-left')
	})

	//resize
	$(window).resize(function(event) {
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
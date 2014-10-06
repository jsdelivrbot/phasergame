var game = null;
var engin = null;
var server = null;

function startGame(_playerData){
	//might want to to pass the events only to the state that is active
	engin = new Phaser.Game(800,600,'auto','game', { preload: preload, create: create, update: update, render: render},false,false)
	server = new Server()
	//start the game
	game = new Game()
}

$(document).ready(function() {
	ko.applyBindings(page);
	$(document).foundation();

	//start the engin / server / states
	startGame();
	
	
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

	//resize
	$(window).resize(function(event) {
		engin.scale.scaleMode = 2;
		engin.scale.setMaximum()
		engin.scale.refresh()
	});
});
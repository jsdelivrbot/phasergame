var engin = null;

function loadData(cb){
	cb = _.after(1,cb)

	//sound.json
	$.ajax({
		url: 'snd/sound.json',
		type: 'GET',
		dataType: 'json'
	})
	.done(function(data) {
		sound.json = data

		cb()
	})
	.fail(function() {
		throw new Error('failed to load sound json')
	})
}

$(document).ready(function() {
	ko.applyBindings(page);
	$(document).foundation();

	loadData(function(){
		engin = new Phaser.Game(800,600,'auto','game', { preload: preload, create: create, update: update, render: render},false,false)
	})

	
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
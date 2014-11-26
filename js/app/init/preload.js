loadedData = {}
function loadData(cb){
	cb = _.after(4,cb)

	//tilesets.json
	$.ajax({
		url: 'data/tilesets.json',
		type: 'GET',
		dataType: 'json'
	})
	.done(function(data) {
		loadedData.tilesets = data

		cb()
	})
	.fail(function() {
		throw new Error('failed to load tilesets json')
	})

	//sound.json
	$.ajax({
		url: 'data/sound.json',
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

	//playerImages.json
	$.ajax({
		url: 'data/playerImages.json',
		type: 'GET',
		dataType: 'json'
	})
	.done(function(data) {
		loadedData.playerImages = data

		cb()
	})
	.fail(function() {
		throw new Error('failed to load playerImages json')
	})

	//items
	$.ajax({
		url: 'data/items.json',
		type: 'GET',
		dataType: 'json'
	})
	.done(function(data) {
		items.setItems(data)

		cb()
	})
	.fail(function() {
		throw new Error('failed to load items json')
	})
}

function preload(){
	//engin settings
	engin.stage.disableVisibilityChange = true;


	//image
	engin.load.image('door','imgs/other/door.png')


	//player
	for (var i = 0; i < loadedData.playerImages.length; i++) {
		engin.load.spritesheet('player/'+(i+1),loadedData.playerImages[i],32,48)
	};


	//load the sound
	for (var k in sound.json.background) {
		for (var i = 0; i < sound.json.background[k].length; i++) {
			s = sound.json.background[k][i]
			engin.load.audio(s.url,'snd/background/'+s.url,true)
		};
	};


	// tilesets
	for (var i = 0; i < loadedData.tilesets.length; i++) {
		engin.load.image(loadedData.tilesets[i].name,loadedData.tilesets[i].url);
	};


	//loading bar
	engin.load.onFileComplete.add(function(){
		// $('#loading-bar>span').css('width',engin.load.progressFloat + '%')
	})

	engin.load.onLoadComplete.add(function(){
		engin.load.onLoadStart.removeAll()
		engin.load.onFileComplete.removeAll()
		engin.load.onLoadComplete.removeAll()
	})
}
loadedData = {}
function loadData(cb){
	cb = _.after(3,cb)

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
}
function loadShardData(cb){
	cb = _.after(4,cb)
	url = server.url.protocol + '//' + server.url.hostname + ':8282'

	$.ajax({
		url: url,
		type: 'GET',
		dataType: 'json',
		data: {type: 'dataFile', file: 'items'},
	})
	.done(function(data) {
		//update the pages items
		page.items(fn.idArray(data,'title'));

		cb();
	})
	.fail(function() {
		throw new Error('failed to load items json')
	})

	$.ajax({
		url: url,
		type: 'GET',
		dataType: 'json',
		data: {type: 'dataFile', file: 'damageProfiles'},
	})
	.done(function(data) {
		//nothing to do with it yet
		cb();
	})
	.fail(function() {
		throw new Error('failed to load damageProfiles json')
	})

	$.ajax({
		url: url,
		type: 'GET',
		dataType: 'json',
		data: {type: 'dataFile', file: 'resourceProfiles'},
	})
	.done(function(data) {
		//nothing to do with it yet
		cb();
	})
	.fail(function() {
		throw new Error('failed to load resourceProfiles json')
	})

	$.ajax({
		url: url,
		type: 'GET',
		dataType: 'json',
		data: {type: 'dataFile', file: 'miningProfiles'},
	})
	.done(function(data) {
		//nothing to do with it yet
		cb();
	})
	.fail(function() {
		throw new Error('failed to load miningProfiles json')
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
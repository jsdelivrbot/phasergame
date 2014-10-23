//engin events
function create(){
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

	//resize the engin to fit the screen
	$(window).trigger('resize')
}
function update(){
	if(game.active){
		game.step()
	}
}
function render(){
	if(game.active){
		engin.debug.text('fps: '+engin.time.fps,32,32)
	}
}

game = {
	active: false,

	map: null,
	layers: {
		ground: null,
		col: null,
		layer2: null,
		layer3: null,
		layer4: null,
		doors: null
	},

	timers: {
		sendPlayerData: -1,
	},

	players: new Players(),

	//engin events
	step: function(){
		//see if im active
		if(game.active){
			//send updates to controlers/objs that need it
			game.players.step()
		}
	},

	//clear canvas and start the game state
	enter: function(){
		if(game.active){
			return;
		}

		game.active = true;

		game.players.createPlayer(server.in.player.data);

		//turn the keyboard on
		keyBindings.enable('game')

		f = _(game.players.sendData).bind(game.players,game.players.player.data.data)
		game.timers.sendPlayerData = window.setInterval(f,100)
	},

	//clear canvas and end game state
	exit: function(){
		if(!game.active){
			return;
		}

		game.active = false;
		//tell players to get rid of all players
		game.players.destroyAll();
		//remove map
		if(game.map){
			game.layers.ground.destroy()
			game.layers.layer2.destroy()
			game.layers.layer3.destroy()
			game.layers.layer4.destroy()
			game.layers.col.destroy()
			game.map.destroy()
		}

		//timers
		window.clearInterval(game.timers.sendPlayerData);
	},

	//functions
	loadMap: function(_island,_map,callback){
		//when the map is loaded call this
		game._createMap = function(){
			//see if the old map is there
			if(game.map){
				game.layers.ground.destroy()
				game.layers.layer2.destroy()
				game.layers.layer3.destroy()
				game.layers.layer4.destroy()
				game.layers.col.destroy()
				game.map.destroy()
			}

			game.map = engin.add.tilemap('island:'+_island+',map:'+_map)
			game.map.properties.spawnX = parseInt(game.map.properties.spawnX)
			game.map.properties.spawnY = parseInt(game.map.properties.spawnY)
			//add the tilesets
			for (var i = 0; i < engin.cache.getTilemapData('island:'+_island+',map:'+_map).data.tilesets.length; i++) {
				_t = engin.cache.getTilemapData('island:'+_island+',map:'+_map).data.tilesets[i].name;
				game.map.addTilesetImage(_t,'tileset/'+_t)
			};

			//set up the layers
			game.layers.ground = game.map.createLayer('ground');
			game.layers.layer2 = game.map.createLayer('layer2');
			game.layers.layer3 = game.map.createLayer('layer3');
			game.layers.layer4 = game.map.createLayer('layer4');
			game.layers.col = game.map.createLayer('col');

			game.layers.col.visible = false

			//get the layers fixed, cant move the other players yet becuace they have not been created
    		game.players.fixPlayersLevels()

			//set up the collition
			for (var i = 0; i < game.map.tilesets.length; i++) {
				if(game.map.tilesets[i].name == 'col'){
					game.map.setCollisionBetween(game.map.tilesets[i].firstgid, game.map.tilesets[i].firstgid + game.map.tilesets[i].total, true, game.layers.col)
				}
			}; 

			game.layers.ground.resizeWorld();

			//loop through the doors and create the col
			game.layers.doors = engin.add.group()
		    game.layers.doors.enableBody = true;
		    game.layers.doors.physicsBodyType = Phaser.Physics.ARCADE;
			for (var i = 0; i < game.map.objects.doors.length; i++) {
				_door = game.layers.doors.create(game.map.objects.doors[i].x,game.map.objects.doors[i].y,'door')

    			_door.body.immovable = true;
    			_door.body.offset.x = -2
    			_door.body.offset.y = -2
    			_door.body.width = game.map.objects.doors[i].width + 4
    			_door.body.height = game.map.objects.doors[i].height + 4

    			_door.properties = {}
				_door.properties.island = parseInt(game.map.objects.doors[i].properties.island)
				_door.properties.map = parseInt(game.map.objects.doors[i].properties.map)
				_door.properties.x = parseInt(game.map.objects.doors[i].properties.x)
				_door.properties.y = parseInt(game.map.objects.doors[i].properties.y)
			};

			//set the background sound mood
			if(game.map.properties.mood){
				sound.background.mood = game.map.properties.mood;
			}
			else{
				sound.background.mood = 'default'
			}

			if(callback){
				callback()
			}
		}

		//load the tile map
		if(!engin.cache.checkTilemapKey('island:'+_island+',map:'+_map)){
			// engin.load.onLoadComplete.removeAll()
			url = server.url.protocol + '//' + server.url.hostname + ':8282';
			url += '?type=map&island='+_island+'&map='+_map;
			engin.load.tilemap('island:'+_island+',map:'+_map,url, null, Phaser.Tilemap.TILED_JSON)
			engin.load.onLoadComplete.add(game._createMap,game)
			engin.load.start()
		}
		else{
			game._createMap()
		}
	}
}
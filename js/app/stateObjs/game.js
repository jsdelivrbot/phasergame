//engin events
function create(){
	//set up
	engin.time.advancedTiming = true
	engin.physics.startSystem(Phaser.Physics.ARCADE);

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

Game = Klass({
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

	players: null,

	//functions
	initialize: function(){
		this.players = new Players()
	},

	//engin events
	step: function(){
		//see if im active
		if(this.active){
			//send updates to controlers/objs that need it
			this.players.step()
		}
	},

	//clear canvas and start the game state
	enter: function(){
		if(this.active){
			return;
		}

		this.active = true;

		this.players.createPlayer(server.in.player.data);


		f = _(this.players.sendData).bind(this.players)
		this.timers.sendPlayerData = window.setInterval(f,100)
	},

	//clear canvas and end game state
	exit: function(){
		if(!this.active){
			return;
		}

		this.active = false;
		//tell players to get rid of all players
		this.players.destroyAll();
		//remove map
		if(this.map){
			this.layers.ground.destroy()
			this.layers.layer2.destroy()
			this.layers.layer3.destroy()
			this.layers.layer4.destroy()
			this.layers.col.destroy()
			this.map.destroy()
		}

		//timers
		window.clearInterval(this.timers.sendPlayerData);
	},

	//functions
	loadMap: function(_island,_map,callback){
		//when the map is loaded call this
		this._createMap = function(){
			//see if the old map is there
			if(this.map){
				this.layers.ground.destroy()
				this.layers.layer2.destroy()
				this.layers.layer3.destroy()
				this.layers.layer4.destroy()
				this.layers.col.destroy()
				this.map.destroy()
			}

			this.map = engin.add.tilemap('island:'+_island+',map:'+_map)
			this.map.properties.spawnX = parseInt(this.map.properties.spawnX)
			this.map.properties.spawnY = parseInt(this.map.properties.spawnY)
			//add the tilesets
			for (var i = 0; i < engin.cache.getTilemapData('island:'+_island+',map:'+_map).data.tilesets.length; i++) {
				_t = engin.cache.getTilemapData('island:'+_island+',map:'+_map).data.tilesets[i].name;
				this.map.addTilesetImage(_t,'tileset/'+_t)
			};

			//set up the layers
			this.layers.ground = this.map.createLayer('ground');
			this.layers.layer2 = this.map.createLayer('layer2');
			this.layers.layer3 = this.map.createLayer('layer3');
			this.layers.layer4 = this.map.createLayer('layer4');
			this.layers.col = this.map.createLayer('col');

			this.layers.col.visible = false

			//get the layers fixed, cant move the other players yet becuace they have not been created
    		this.players.fixPlayersLevels()

			//set up the collition
			for (var i = 0; i < this.map.tilesets.length; i++) {
				if(this.map.tilesets[i].name == 'col'){
					this.map.setCollisionBetween(this.map.tilesets[i].firstgid, this.map.tilesets[i].firstgid + this.map.tilesets[i].total, true, this.layers.col)
				}
			}; 

			this.layers.ground.resizeWorld();

			//loop through the doors and create the col
			this.layers.doors = engin.add.group()
		    this.layers.doors.enableBody = true;
		    this.layers.doors.physicsBodyType = Phaser.Physics.ARCADE;
			for (var i = 0; i < this.map.objects.doors.length; i++) {
				_door = this.layers.doors.create(this.map.objects.doors[i].x,this.map.objects.doors[i].y,'door')

    			_door.body.immovable = true;
    			_door.body.offset.x = -2
    			_door.body.offset.y = -2
    			_door.body.width = this.map.objects.doors[i].width + 4
    			_door.body.height = this.map.objects.doors[i].height + 4

    			_door.properties = {}
				_door.properties.island = parseInt(this.map.objects.doors[i].properties.island)
				_door.properties.map = parseInt(this.map.objects.doors[i].properties.map)
				_door.properties.x = parseInt(this.map.objects.doors[i].properties.x)
				_door.properties.y = parseInt(this.map.objects.doors[i].properties.y)
			};

			if(callback){
				callback()
			}
		}

		//load the tile map
		if(!engin.cache.checkTilemapKey('island:'+_island+',map:'+_map)){
			// engin.load.onLoadComplete.removeAll()
			url = server.host + ':8282';
			url += '?type=map&island='+_island+'&map='+_map;
			engin.load.tilemap('island:'+_island+',map:'+_map,url, null, Phaser.Tilemap.TILED_JSON)
			engin.load.onLoadComplete.add(this._createMap,this)
			engin.load.start()
		}
		else{
			this._createMap()
		}
	}
})
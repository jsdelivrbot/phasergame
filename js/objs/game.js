//main game obj, created when we have a connection and the engin running
Game = Klass({
	engin: null,
	server: null,

	map: null,
	layers: {
		ground: null,
		col: null,
		layer2: null,
		layer3: null,
		layer4: null,
		doors: null
	},

	players: null,

	//functions
	initialize: function(_engin,_server){
		this.engin = _engin
		this.server = _server
		this.players = new Players()
	},

	//engin events
	step: function(){
		//send updates to controlers/objs that need it
		this.players.step()
		this.players.updatePlayer()
	},

	loadMap: function(_island,_map,callback){
		//see if we have the map
		_islands = this.engin.cache.getJSON("islands")
		if(_islands[_island]){
			if(_islands[_island].maps[_map]){

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

					this.map = this.engin.add.tilemap('map-'+_islands[_island].maps[_map].id)
					//add the tilesets
					for (var i = 0; i < this.engin.cache.getTilemapData('map-'+_islands[_island].maps[_map].id).data.tilesets.length; i++) {
						_t = this.engin.cache.getTilemapData('map-'+_islands[_island].maps[_map].id).data.tilesets[i].name;
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
		    		this.players.player.sprite.bringToTop()
					this.layers.layer4.bringToTop()

					//set up the collition
					for (var i = 0; i < this.map.tilesets.length; i++) {
						if(this.map.tilesets[i].name == 'col'){
							this.map.setCollisionBetween(this.map.tilesets[i].firstgid, this.map.tilesets[i].firstgid + this.map.tilesets[i].total, true, this.layers.col)
						}
					}; 

					this.layers.ground.resizeWorld();

					//loop through the doors and create the col
					this.layers.doors = this.engin.add.group()
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

					// set the players position
					if(game.players.player){
						game.players.player.update({
							position: {
								body: {
									x: parseInt(game.map.properties.spawnX) * game.map.tileWidth,
									y: parseInt(game.map.properties.spawnY) * game.map.tileHeight
								},
								island: _island,
								map: _map
							}
						})
					}

					if(callback){
						callback()
					}
				}

				//load the tile map
				if(!this.engin.cache.checkTilemapKey('map-'+_islands[_island].maps[_map].id)){
					// engin.load.onLoadComplete.removeAll()
					this.engin.load.tilemap('map-'+_islands[_island].maps[_map].id,'maps/'+_islands[_island].maps[_map].url, null, Phaser.Tilemap.TILED_JSON)
					this.engin.load.onLoadComplete.add(this._createMap,this)
					this.engin.load.start()
				}
				else{
					this._createMap()
				}
			}
		}
	}
})
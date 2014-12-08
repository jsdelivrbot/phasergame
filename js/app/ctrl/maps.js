maps = {
	map: null, 
	layers: {
		ground: null,
		col: null,
		layer2: null,
		layer3: null,
		layer4: null,
		doors: null
	},
	getMap: function(id,cb){
		//load the map
		if(engin.cache.checkTilemapKey(server.url.hostname+'/map/'+id)){
			if(cb){
				cb(server.url.hostname+'/map/'+id);
			}
		}
		else{
			//load it
			url = server.url.protocol + '//' + server.url.hostname + ':8282';
			url += '?type=map&map='+id;
			engin.load.tilemap(server.url.hostname+'/map/'+id, url, null, Phaser.Tilemap.TILED_JSON)
			engin.load.onLoadComplete.add(function(cb,cacheID){
				//this is the cb
				if(cb){
					cb(cacheID);
				}
			}.bind(this,cb,server.url.hostname+'/map/'+id),this)
			engin.load.start()
		}
	},
	createMap: function(cacheID){
		if(maps.map){
			console.log('cant load a map without destroying it first')
			return;
		}

		map = engin.add.tilemap(cacheID)
		map.properties.spawnX = parseInt(map.properties.spawnX)
		map.properties.spawnY = parseInt(map.properties.spawnY)
		//add the tilesets
		for (var i = 0; i < map.tilesets.length; i++) {
			_t = map.tilesets[i].name;
			map.addTilesetImage(_t,'tileset/'+_t)
		};

		//set up the layers
		maps.layers.ground = map.createLayer('ground');
		maps.layers.layer2 = map.createLayer('layer2');
		maps.layers.layer3 = map.createLayer('layer3');
		maps.layers.layer4 = map.createLayer('layer4');
		maps.layers.col = map.createLayer('col');

		maps.layers.col.visible = false;

		//set up the collition
		for (var i = 0; i < map.tilesets.length; i++) {
			if(map.tilesets[i].name == 'col'){
				map.setCollisionBetween(map.tilesets[i].firstgid, map.tilesets[i].firstgid + map.tilesets[i].total, true, maps.layers.col)
			}
		};

		//loop through the doors and create the col
		maps.layers.doors = engin.add.group()
	    maps.layers.doors.enableBody = true;
	    maps.layers.doors.physicsBodyType = Phaser.Physics.ARCADE;
		for (var i = 0; i < map.objects.doors.length; i++) {
			d = map.objects.doors[i];
			_door = maps.layers.doors.create(d.x,d.y,'door')

			_door.body.immovable = true;
			_door.body.offset.x = -2
			_door.body.offset.y = -2
			_door.body.width = d.width + 4
			_door.body.height = d.height + 4

			_door.properties = {}
			_door.properties.map = parseInt(d.properties.map)
			_door.properties.x = parseInt(d.properties.x)
			_door.properties.y = parseInt(d.properties.y)
		};

		//resize the world
		maps.layers.ground.resizeWorld();

		//set the background sound mood
		if(map.properties.mood){
			sound.background.mood = maps.map.properties.mood;
		}
		else{
			sound.background.mood = 'default'
		}

		//fix the layers
		game.players.fixPlayersLevels();

		maps.map = map;

		return true;
	},
	destroyMap: function(id){
		if(maps.map){
			maps.layers.ground.destroy()
			maps.layers.layer2.destroy()
			maps.layers.layer3.destroy()
			maps.layers.layer4.destroy()
			maps.layers.col.destroy()
			maps.map.destroy()
			maps.map = null;
		}
	},
	load: function(id,cb){
		//destory the map
		maps.getMap(id,function(cacheID){
			if(cacheID){
				maps.destroyMap();
				if(maps.createMap(cacheID)){
					if(cb) cb(true);
					return;
				}
			}
			else{
				console.log('cant load the map')
				if(cb) cb(false);
				return;
			}
		})
	}
}
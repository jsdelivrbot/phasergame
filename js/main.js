var game = new Phaser.Game(800,600,Phaser.AUTO,'game', { preload: preload, create: create, update: update, render: render} )
var player = null;
var map = null;
var ground = null;
var layer2 = null;
var layer3 = null;
var doors = null;
var col = null;

function preload(){
	//data
	game.load.json('islands','data/islands.json')

	//image
	game.load.image('door','imgs/other/door.png')

	//player
	//fighter
	game.load.spritesheet('player/1','imgs/player/fighter/01.png',32,48)
	game.load.spritesheet('player/2','imgs/player/fighter/02.png',32,48)
	game.load.spritesheet('player/3','imgs/player/fighter/03.png',32,48)
	game.load.spritesheet('player/4','imgs/player/fighter/04.png',32,48)
	game.load.spritesheet('player/5','imgs/player/fighter/05.png',32,48)
	game.load.spritesheet('player/6','imgs/player/fighter/06.png',32,48)
	game.load.spritesheet('player/7','imgs/player/fighter/07.png',32,48)
	game.load.spritesheet('player/8','imgs/player/fighter/08.png',32,48)
	//lancer
	game.load.spritesheet('player/9','imgs/player/lancer/01.png',32,48)
	game.load.spritesheet('player/10','imgs/player/lancer/02.png',32,48)
	game.load.spritesheet('player/11','imgs/player/lancer/03.png',32,48)
	game.load.spritesheet('player/12','imgs/player/lancer/04.png',32,48)
	//warrior
	game.load.spritesheet('player/13','imgs/player/warrior/01.png',32,48)
	game.load.spritesheet('player/14','imgs/player/warrior/02.png',32,48)


	//tile sets
	game.load.image('tileset/land','imgs/land.png')
	game.load.image('tileset/misc','imgs/misc.png')
	game.load.image('tileset/col','imgs/col.png')

	//land
	game.load.image('tileset/CastleTown','imgs/CastleTown.png')
	game.load.image('tileset/CastleTown2','imgs/CastleTown2.png')

	game.load.image('tileset/Cave','imgs/Cave.png')

	game.load.image('tileset/DesertTown','imgs/DesertTown.png')
	game.load.image('tileset/DesertTown2','imgs/DesertTown2.png')

	game.load.image('tileset/FarmVillage','imgs/FarmVillage.png')
	game.load.image('tileset/FarmVillage2','imgs/FarmVillage2.png')

	game.load.image('tileset/Forest','imgs/Forest.png')
	game.load.image('tileset/ForestTown','imgs/ForestTown.png')
	game.load.image('tileset/ForestTown2','imgs/ForestTown2.png')

	game.load.image('tileset/grassland','imgs/grassland.png')

	game.load.image('tileset/MineTown','imgs/MineTown.png')
	game.load.image('tileset/MineTown2','imgs/MineTown2.png')

	game.load.image('tileset/Mountain','imgs/Mountain.png')	

	game.load.image('tileset/PortTown','imgs/PortTown.png')
	game.load.image('tileset/PortTown2','imgs/PortTown2.png')

	game.load.image('tileset/PostTown','imgs/PostTown.png')
	game.load.image('tileset/PostTown2','imgs/PostTown2.png')

	game.load.image('tileset/Snowfield','imgs/Snowfield.png')
	game.load.image('tileset/SnowTown','imgs/SnowTown.png')
	game.load.image('tileset/SnowTown2','imgs/SnowTown2.png')

	game.load.image('tileset/Swamp','imgs/Swamp.png')	

	game.load.image('tileset/Woods','imgs/Woods.png')	

	$('#progressbar').progressbar({
		max: 100
	})

	game.load.onLoadStart.add(function(){
		$('#loading-overlay').show()
	})

	game.load.onFileComplete.add(function(){
		// console.log('load:'+game.load.progressFloat)
		$('#progressbar').progressbar('value',game.load.progressFloat)
	})

	game.load.onLoadComplete.add(function(){
		$('#loading-overlay').hide()
	})
}

function create(){
	//set up
	game.time.advancedTiming = true
	game.physics.startSystem(Phaser.Physics.ARCADE);

	//player
	player = game.add.sprite(0, 0,'player/1')

	//set up the animations
	player.animations.add('down',[0,1,2,3],10,true,true)
	player.animations.add('left',[4,5,6,7],10,true,true)
	player.animations.add('right',[8,9,10,11],10,true,true)
	player.animations.add('up',[12,13,14,15],10,true,true)

    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.setSize(20,18,6,30);

	game.camera.follow(player)
	
	//set the player invisible so when the world if loading we dont see him
	player.visible = false

	//load the first map
	loadMap(0,0,function(){
		player.visible = true
		player.bringToTop()

		//move the player to spawn
		player.x = map.properties.spawnX * map.tileWidth;
		player.y = map.properties.spawnY * map.tileHeight;
	})
}

function update(){
	if(player){
		if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
	    {
	        player.body.velocity.x = 200;
	    	player.body.velocity.y = 0
	        player.animations.play('right')
	    }
	 	else if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
	    {
	        player.body.velocity.x = -200;
	    	player.body.velocity.y = 0
	        player.animations.play('left')
	    }
	    else if (game.input.keyboard.isDown(Phaser.Keyboard.UP))
	    {
	        player.body.velocity.y = -200;
	    	player.body.velocity.x = 0
	        player.animations.play('up')
	    }
	    else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN))
	    {
	        player.body.velocity.y = 200;
	    	player.body.velocity.x = 0
	        player.animations.play('down')
	    }
	    else{
	    	player.body.velocity.y = 0
	    	player.body.velocity.x = 0
	    	player.animations.stop()
	    }

	    //col
	    if(col){
	    	game.physics.arcade.collide(player, col);
	    }

	    if(doors){
	    	game.physics.arcade.collide(player, doors, function(_player,_door){
				//set the player invisible so when the world if loading we dont see him
				player.visible = false

	    		loadMap(_door.properties.island,_door.properties.map,function(){
					player.visible = true
	    			player.bringToTop()

					//move the player to spawn
					player.x = (_door.properties.x || parseInt(map.properties.spawnX)) * map.tileWidth;
					player.y = (_door.properties.y || parseInt(map.properties.spawnY)) * map.tileHeight;
	    		})
	    	},null,this)
	    }
	}
}

function render(){
	game.debug.text('fps: '+game.time.fps,32,32)
	//player
	// if(player){
	// 	game.debug.body(player)
	// }
}

function loadMap(_island,_map,callback){
	//see if we have the map
	_islands = game.cache.getJSON("islands")
	if(_islands[_island]){
		if(_islands[_island].maps[_map]){

			//when the map is loaded call this
			function _createMap(){
				//see if the old map is there
				if(map){
					ground.destroy()
					layer2.destroy()
					layer3.destroy()
					col.destroy()
					map.destroy()
				}

				map = game.add.tilemap('map-'+_islands[_island].maps[_map].id)
				//add the tilesets
				for (var i = 0; i < game.cache.getTilemapData('map-'+_islands[_island].maps[_map].id).data.tilesets.length; i++) {
					_t = game.cache.getTilemapData('map-'+_islands[_island].maps[_map].id).data.tilesets[i].name;
					map.addTilesetImage(_t,'tileset/'+_t)
				};

				//set up the layers
				ground = map.createLayer('ground');
				layer2 = map.createLayer('layer2');
				layer3 = map.createLayer('layer3');
				col = map.createLayer('col');

				col.visible = false

				//set up the collition
				for (var i = 0; i < map.tilesets.length; i++) {
					if(map.tilesets[i].name == 'col'){
						map.setCollisionBetween(map.tilesets[i].firstgid, map.tilesets[i].firstgid + map.tilesets[i].total, true, col)
					}
				}; 

				//fix the col
				// map.forEach(function(_tile){
				// 	if(_tile.index != -1){
				// 		console.log(_tile.index)
				// 	}
				// 	return;
				// },this,0,0,map.width,map.height,col)

				ground.resizeWorld();

				//loop through the doors and create the col
				doors = game.add.group()
			    doors.enableBody = true;
			    doors.physicsBodyType = Phaser.Physics.ARCADE;
				for (var i = 0; i < map.objects.doors.length; i++) {
					_door = doors.create(map.objects.doors[i].x,map.objects.doors[i].y,'door')

        			_door.body.immovable = true;
        			_door.body.offset.x = -2
        			_door.body.offset.y = -2
        			_door.body.width = map.objects.doors[i].width + 4
        			_door.body.height = map.objects.doors[i].height + 4

        			_door.properties = {}
					_door.properties.island = parseInt(map.objects.doors[i].properties.island)
					_door.properties.map = parseInt(map.objects.doors[i].properties.map)
					_door.properties.x = parseInt(map.objects.doors[i].properties.x)
					_door.properties.y = parseInt(map.objects.doors[i].properties.y)
				};

				if(callback){
					callback()
				}
			}

			//load the tile map
			if(!game.cache.checkTilemapKey('map-'+_islands[_island].maps[_map].id)){
				// game.load.onLoadComplete.removeAll()
				game.load.tilemap('map-'+_islands[_island].maps[_map].id,'maps/'+_islands[_island].maps[_map].url, null, Phaser.Tilemap.TILED_JSON)
				game.load.onLoadComplete.add(_createMap)
				game.load.start()
			}
			else{
				_createMap()
			}
		}
	}
}
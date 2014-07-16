var game = new Phaser.Game(800,600,Phaser.AUTO,'game', { preload: preload, create: create, update: update, render: render} )
var player = null;
var map = null;
var ground = null;
var layer2 = null;
var layer3 = null;
var doors = null;
var col = null;

function preload(){
	game.load.spritesheet('player','imgs/player/player1.png',32,48)
	game.load.json('islands','php/get-islands.php')
	//tile sets
	game.load.image('tileset/land','imgs/land.png')
	game.load.image('tileset/misc','imgs/misc.png')
	game.load.image('tileset/col','imgs/col.png')
	game.load.image('tileset/PortTown','imgs/PortTown.png')
	game.load.image('tileset/PortTown2','imgs/PortTown2.png')
}

function create(){
	//set up
	game.time.advancedTiming = true
	game.physics.startSystem(Phaser.Physics.ARCADE);

	loadMap(0,0,createPlayer)
}

function update(){
	if(player){
		if (game.input.keyboard.isDown(Phaser.Keyboard.UP))
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
	    else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
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
	    else{
	    	player.body.velocity.y = 0
	    	player.body.velocity.x = 0
	    	player.animations.stop()
	    }

	    //col
	    if(col){
	    	game.physics.arcade.collide(player, col);
	    }
	}
}

function render(){
	game.debug.text('fps: '+game.time.fps,32,32)
	//player
	/*
	if(player){
		game.debug.body(player)
	}
	*/
}

function loadMap(_island,_map,callback){
	//see if we have the map
	_islands = game.cache.getJSON("islands")
	if(_islands[_island]){
		if(_islands[_island].maps[_map]){

			//when the map is loaded call this
			function _createMap(){
				console.log('creating map')

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
				doors = map.objects.doors

				col.visible = false

				//set up the collition
				for (var i = 0; i < map.tilesets.length; i++) {
					if(map.tilesets[i].name == 'col'){
						map.setCollisionBetween(map.tilesets[i].firstgid, map.tilesets[i].firstgid + map.tilesets[i].total, true, col)
					}
				}; 

				ground.resizeWorld();

				//loop through the doors and create the col
				// for (var i = 0; i < doors.length; i++) {
				// 	doors[i] = game.add.sprite(doors[i].x,doors[i].y,'player')
				// };

				if(callback){
					callback()
				}
			}

			//load the tile map
			if(!game.cache.checkTilemapKey('map-'+_islands[_island].maps[_map].id)){
				game.load.tilemap('map-'+_islands[_island].maps[_map].id,'maps/'+_islands[_island].maps[_map].url, null, Phaser.Tilemap.TILED_JSON)
				game.load.onLoadComplete.add(function(){
					_createMap()
				},this)
				game.load.start()
			}
			else{
				_createMap()
			}
		}
	}
}

function createPlayer(){
	if(player){
		player.destroy()
	}

	//create a new
	player = game.add.sprite(0, 0,'player')

	//set up the animations
	player.animations.add('down',[0,1,2,3],10,true,true)
	player.animations.add('left',[4,5,6,7],10,true,true)
	player.animations.add('right',[8,9,10,11],10,true,true)
	player.animations.add('up',[12,13,14,15],10,true,true)

    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.setSize(24,24,4,20);
    player.body.collideWorldBounds = true

	game.camera.follow(player)

	//move the player to spawn
	player.x = map.properties.spawnX * map.tileWidth;
	player.y = map.properties.spawnY * map.tileHeight;
}
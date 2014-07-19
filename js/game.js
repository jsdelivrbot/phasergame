var game = null;
var player = null;
var map = null;
var ground = null;
var layer2 = null;
var layer3 = null;
var doors = null;
var col = null;

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

	//resize the game to fit the screen
	$(window).trigger('resize')
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
				layer4 = map.createLayer('layer4');
				col = map.createLayer('col');

				col.visible = false

				//get the layers fixed
	    		player.bringToTop()
				layer4.bringToTop()

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

$(document).ready(function() {

	//----------------------first--------------------

	//aply the bindings onto the settings ko
	ko.applyBindings(settings,$('#settings-window').get(0));

	//start the game
	game = new Phaser.Game(800,600,settings.graphics.renderMode(),'game', { preload: preload, create: create, update: update, render: render},false,false)


	//---------------------background----------------------

	//dialog
	$(".dialog").dialog({
		draggable: false,
		resizable: false,
		autoOpen: false,
		modal: true,
		width: window.innerWidth - 100,
		height: window.innerHeight - 100
	})

	//popups
	$('.popup').each(function(index){
		$(this).dialog({
			title: $(this).data('title'),
			resizable: false,
			autoOpen: false,
			modal: true
		})
	})

	//tooltips
	$(".tool-tip").tooltip({
		content: $(this).data('tool-tip')
	})

	//select
	$('select').selectmenu({
		width:200,
		change: function(event,ui){
			$(event.target).trigger('change')
		}
	});


	//---------------------app--------------------
	
	//progressbar
	$('#progress-bar').progressbar({
		max: 100,
      	value: false,
		change: function() {
			$('#progress-bar .progress-label').text( Math.ceil($('#progress-bar').progressbar( "value" )) + "%" );
		},
		complete: function() {
			$('#progress-bar .progress-label').text("Complete!");
		}
	})

	$('#menu').dialog("option",{
		title: "Menu",
		buttons: [ 
			{ 
				text: "Save", 
				click: function() 
				{
				 	$(this).dialog("close"); 
				 	localStorage.setItem('settings',ko.mapping.toJSON(settings))
				 	$("#reload-popup").dialog('open')
				} 
			} 
		]
	})

	//popups
	$('#reload-popup').dialog('option','buttons',[
		{
			text: 'Not now',
			click: function() 
			{
			 	$(this).dialog("close"); 
			}
		},
		{
			text: 'reload',
			click: function() 
			{
			 	location.reload()
			} 
		}
	])

	//buttons
	$('#menu-button').button({
		text: false,
		icons: {primary: "ui-icon-gear"}
	}).click(function(event) {
		$('#menu').dialog('open')
	});

	//resize
	$(window).resize(function(event) {
		$(".menu").dialog({
			width: window.innerWidth - 100,
			height: window.innerHeight - 100
		})

		game.scale.scaleMode = 2;
		game.scale.setMaximum()
		game.scale.refresh()
	});
});

//temp
function resizeGame() {
	var height = $(window).height();
	var width = $(window).width();
		
	game.width = width;
	game.height = height;
	game.stage.bounds.width = width;
	game.stage.bounds.height = height;
	game.camera.setSize(width,height)
		
	if (game.renderType === Phaser.WEBGL)
	{
		game.renderer.resize(width, height);
	}
}
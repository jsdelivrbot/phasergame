//NOT USED

function Player(){
	//player
	_player = game.engin.add.sprite(0, 0,'player/1')

	//set up the animations
	_player.animations.add('down',[0,1,2,3],10,true,true)
	_player.animations.add('left',[4,5,6,7],10,true,true)
	_player.animations.add('right',[8,9,10,11],10,true,true)
	_player.animations.add('up',[12,13,14,15],10,true,true)

    game.engin.physics.enable(_player, Phaser.Physics.ARCADE);
    _player.body.setSize(20,18,6,30);

    _player.update = function(){
		if (game.engin.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
	    {
	        game.player.body.velocity.x = 200;
	    	game.player.body.velocity.y = 0
	        game.player.animations.play('right')
	    }
	 	else if (game.engin.input.keyboard.isDown(Phaser.Keyboard.LEFT))
	    {
	        game.player.body.velocity.x = -200;
	    	game.player.body.velocity.y = 0
	        game.player.animations.play('left')
	    }
	    else if (game.engin.input.keyboard.isDown(Phaser.Keyboard.UP))
	    {
	        game.player.body.velocity.y = -200;
	    	game.player.body.velocity.x = 0
	        game.player.animations.play('up')
	    }
	    else if (game.engin.input.keyboard.isDown(Phaser.Keyboard.DOWN))
	    {
	        game.player.body.velocity.y = 200;
	    	game.player.body.velocity.x = 0
	        game.player.animations.play('down')
	    }
	    else{
	    	game.player.body.velocity.y = 0
	    	game.player.body.velocity.x = 0
	    	game.player.animations.stop()
	    }

	    //col
	    if(game.col){
	    	game.engin.physics.arcade.collide(game.player, game.col);
	    }

	    if(game.doors){
	    	game.engin.physics.arcade.collide(player, doors, function(_player,_door){
				//set the player invisible so when the world if loading we dont see him
				game.player.visible = false

	    		game.loadMap(_door.properties.island,_door.properties.map,function(){
					game.player.visible = true

					//move the player to spawn
					game.player.x = (_door.properties.x || parseInt(map.properties.spawnX)) * map.tileWidth;
					game.player.y = (_door.properties.y || parseInt(map.properties.spawnY)) * map.tileHeight;
	    		})
	    	},null,this)
	    }
    }

    _player.remove

	return _player
}
PlayerControl = Player.extend({
	initialize: function(_playerDataJson){
		this.supr(_playerDataJson)
		this.data = new PlayerDataFull(_playerDataJson)
	},
	move: function(){
		if (keyBindings.game.right.isDown())
	    {
			this.sprite.body.velocity.x = 175
			this.sprite.body.velocity.y = 0
	    }
	 	else if (keyBindings.game.left.isDown())
	    {
			this.sprite.body.velocity.x = -175
			this.sprite.body.velocity.y = 0
	    }
	    else if (keyBindings.game.up.isDown())
	    {
			this.sprite.body.velocity.x = 0
			this.sprite.body.velocity.y = -175
	    }
	    else if (keyBindings.game.down.isDown())
	    {
			this.sprite.body.velocity.x = 0
			this.sprite.body.velocity.y = 175
	    }
	    else{
			this.sprite.body.velocity.x = 0
			this.sprite.body.velocity.y = 0
	    }
	    
	    if(maps.layers.col){
	    	engin.physics.arcade.collide(this.sprite, maps.layers.col);
	    }

	    this.data.update({
	    	position: {
	    		body: {
	    			x: this.sprite.position.x,
	    			y: this.sprite.position.y
	    		}
	    	}
	    })
	},
	jump: function(){
		this.sprite.position.x = this.data.data.position.body.x
		this.sprite.position.y = this.data.data.position.body.y
	},
	jumpTo: function(x,y){
		this.sprite.position.x = x
		this.sprite.position.y = y
	},
	step: function(){
		this.supr()
		this.checkCol()
	},
	checkCol: function(){
	    // check for collision
	    engin.physics.arcade.collide(this.sprite,maps.layers.doors,function(_player,_door){
			//set the players map to -1 so other players do not see him go through the door
			game.players.player.data.data.position.map = -1;
			game.players.sendData(game.players.player.data.data);
			//load the map
	    	game.loadMap(_door.properties.map,function(){
	    		if(_door.properties.x && _door.properties.y){
					game.players.player.jumpTo(_door.properties.x*maps.map.tileWidth, _door.properties.y*maps.map.tileHeight)
	    		}
	    		else{
	    			game.players.player.jumpTo(maps.map.properties.spawnX*maps.map.tileWidth, maps.map.properties.spawnY*maps.map.tileHeight)
	    		}
    			game.players.player.data.update({
    				position:{
    					map: _door.properties.map
    				}
    			})
	    	})
	    },null,this)
	}
})
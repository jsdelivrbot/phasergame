PlayerControl = Player.extend({
	initialize: function(_playerDataJson){
		this.supr(_playerDataJson)
		this.data = new PlayerDataFull(_playerDataJson)
	},
	move: function(){
		if (engin.input.keyboard.isDown(Phaser.Keyboard.D))
	    {
			this.sprite.body.velocity.x = 175
			this.sprite.body.velocity.y = 0
	    }
	 	else if (engin.input.keyboard.isDown(Phaser.Keyboard.A))
	    {
			this.sprite.body.velocity.x = -175
			this.sprite.body.velocity.y = 0
	    }
	    else if (engin.input.keyboard.isDown(Phaser.Keyboard.W))
	    {
			this.sprite.body.velocity.x = 0
			this.sprite.body.velocity.y = -175
	    }
	    else if (engin.input.keyboard.isDown(Phaser.Keyboard.S))
	    {
			this.sprite.body.velocity.x = 0
			this.sprite.body.velocity.y = 175
	    }
	    else{
			this.sprite.body.velocity.x = 0
			this.sprite.body.velocity.y = 0
	    }
	    
	    if(game.layers.col){
	    	engin.physics.arcade.collide(this.sprite, game.layers.col);
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
	    engin.physics.arcade.collide(this.sprite,game.layers.doors,function(_player,_door){
	    	game.loadMap(_door.properties.island,_door.properties.map,function(){
	    		if(_door.properties.x && _door.properties.y){
					game.players.player.jumpTo(_door.properties.x*game.map.tileWidth, _door.properties.y*game.map.tileHeight)
	    		}
	    		else{
	    			game.players.player.jumpTo(game.map.properties.spawnX*game.map.tileWidth, game.map.properties.spawnY*game.map.tileHeight)
	    			game.players.player.data.update({
	    				position:{
	    					island: _door.properties.island,
	    					map: _door.properties.map
	    				}
	    			})
	    		}
	    	})
	    },null,this)
	}
})
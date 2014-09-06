PlayerControl = Player.extend({
	initialize: function(_playerDataJson){
		this.supr(_playerDataJson)
		this.data = new PlayerDataFull(_playerDataJson)
	},
	move: function(){
		if (game.engin.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
	    {
			this.sprite.body.velocity.x = 175
			this.sprite.body.velocity.y = 0
	    }
	 	else if (game.engin.input.keyboard.isDown(Phaser.Keyboard.LEFT))
	    {
			this.sprite.body.velocity.x = -175
			this.sprite.body.velocity.y = 0
	    }
	    else if (game.engin.input.keyboard.isDown(Phaser.Keyboard.UP))
	    {
			this.sprite.body.velocity.x = 0
			this.sprite.body.velocity.y = -175
	    }
	    else if (game.engin.input.keyboard.isDown(Phaser.Keyboard.DOWN))
	    {
			this.sprite.body.velocity.x = 0
			this.sprite.body.velocity.y = 175
	    }
	    else{
			this.sprite.body.velocity.x = 0
			this.sprite.body.velocity.y = 0
	    }
	    
	    if(game.layers.col){
	    	game.engin.physics.arcade.collide(this.sprite, game.layers.col);
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
	step: function(){
		this.supr()
		this.checkCol()
	},
	checkCol: function(){
	    // check for collision
	    game.engin.physics.arcade.collide(this.sprite,game.layers.doors,function(_player,_door){
	    	game.loadMap(_door.properties.island,_door.properties.map,function(){
	    		if(_door.properties.x && _door.properties.y){
	    			game.players.player.data.update({
						position: {
							body: {
								x: parseInt(_door.properties.x) * game.map.tileWidth,
								y: parseInt(_door.properties.y) * game.map.tileHeight
							}
						}
					})
					game.players.player.jump()
	    		}
	    	})
	    },null,this)
	}
})
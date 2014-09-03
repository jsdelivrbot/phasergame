PlayerControl = Player.extend({
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
	checkCol: function(){
		this.supr()

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
Players = Class.$extend({
	player: null,
	players: [],

	__init__:function(){
		
	},

	createPlayer: function(){
		this.player = new Entity({
			position:{
				x: 0,
				y: 0,
				island: 0,
				map: 0
			},
			sprite: {
				image: 'player/1',
				animations: {
					animation: 'down'
				}
			}
		})
	},

	update: function(){
		for (var i = 0; i < game.server.in.players.data.length; i++) {
			//update the players based on what the servers data is
			if(game.server.in.players.data[i].id.id in this.players){
				this.players[game.server.in.players.data[i].id.id].update(game.server.in.players.data[i])
			}
			else{
				this.players[game.server.in.players.data[i].id.id] = new Entity(game.server.in.players.data[i])
			}
		};
	},

	updatePlayer: function(){
		if(!this.player){
			this.createPlayer()
		}

		if (game.engin.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
	    {
	        this.player.sprite.body.velocity.x = 200;
	    	this.player.sprite.body.velocity.y = 0
	        this.player.sprite.animations.play('right')
	    }
	 	else if (game.engin.input.keyboard.isDown(Phaser.Keyboard.LEFT))
	    {
	        this.player.sprite.body.velocity.x = -200;
	    	this.player.sprite.body.velocity.y = 0
	        this.player.sprite.animations.play('left')
	    }
	    else if (game.engin.input.keyboard.isDown(Phaser.Keyboard.UP))
	    {
	        this.player.sprite.body.velocity.y = -200;
	    	this.player.sprite.body.velocity.x = 0
	        this.player.sprite.animations.play('up')
	    }
	    else if (game.engin.input.keyboard.isDown(Phaser.Keyboard.DOWN))
	    {
	        this.player.sprite.body.velocity.y = 200;
	    	this.player.sprite.body.velocity.x = 0
	        this.player.sprite.animations.play('down')
	    }
	    else{
	    	this.player.sprite.body.velocity.y = 0
	    	this.player.sprite.body.velocity.x = 0
	    	this.player.sprite.animations.stop()
	    }
	    game.server.out.player.data(this.player.getData())
	}
})
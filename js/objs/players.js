Players = Klass({
	player: null,
	players: [],

	initialize:function(){
		
	},

	createPlayer: function(){
		this.player = new Player(new PlayerData({
			sprite: {
				image: 'player/1'
			}
		}).data)

		game.engin.camera.follow(this.player.sprite)
	},

	step: function(){
		for (var i in this.players) {
			this.players[i].step()
		};
	},

	update: function(){
		// remove the players that are not there
		for (var i in this.players) {
			found = false
			for (var j = 0; j < game.server.in.players.data.length; j++) {
				if(this.players[i].data.data.id.id == game.server.in.players.data[j].id.id){
					found = true
					break;
				}
			};

			if(!found){
				this.players[i].remove()
			}
		};

		//update the players based on what the servers data is
		for (var i = 0; i < game.server.in.players.data.length; i++) {
			if(game.server.in.players.data[i].id.id in this.players){
				this.players[game.server.in.players.data[i].id.id].update(game.server.in.players.data[i])
			}
			else{
				this.players[game.server.in.players.data[i].id.id] = new Player(game.server.in.players.data[i])
			}
		};
	},

	updatePlayer: function(){
		if(!this.player){
			this.createPlayer()
		}

		if (game.engin.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
	    {
	    	data = {
	    		position: {
	    			body: {
	    				vx: 200,
	    				vy: 0
	    			}
	    		},
	    		sprite: {
	    			animations: {
	    				animation: 'right',
	    				playing: true
	    			}
	    		}
	    	}
	    }
	 	else if (game.engin.input.keyboard.isDown(Phaser.Keyboard.LEFT))
	    {
	    	data = {
	    		position: {
	    			body: {
	    				vx: -200,
	    				vy: 0
	    			}
	    		},
	    		sprite: {
	    			animations: {
	    				animation: 'left',
	    				playing: true
	    			}
	    		}
	    	}
	    }
	    else if (game.engin.input.keyboard.isDown(Phaser.Keyboard.UP))
	    {
	    	data = {
	    		position: {
	    			body: {
	    				vx: 0,
	    				vy: -200
	    			}
	    		},
	    		sprite: {
	    			animations: {
	    				animation: 'up',
	    				playing: true
	    			}
	    		}
	    	}
	    }
	    else if (game.engin.input.keyboard.isDown(Phaser.Keyboard.DOWN))
	    {
	    	data = {
	    		position: {
	    			body: {
	    				vx: 0,
	    				vy: 200
	    			}
	    		},
	    		sprite: {
	    			animations: {
	    				animation: 'down',
	    				playing: true
	    			}
	    		}
	    	}
	    }
	    else{
	    	data = {
	    		position: {
	    			body: {
	    				vx: 0,
	    				vy: 0
	    			}
	    		},
	    		sprite: {
	    			animations: {
	    				playing: false
	    			}
	    		}
	    	}
	    }

	    this.player.update(data,true)

	    this.player.step()

	    game.server.out.update.data(this.player.data.data)
	}
})
PlayerData = Class.$extend({
	data: {
		id: {
			id: 0,
			name: '',
			email: '',
			passowrd: ''
		},
		position: {
			body: {
				x: 0,
				y: 0,
				vx: 0,
				vy: 0
			},
			island: 0,
			map: 0,
		},
		sprite: {
			image: '',
			animations: {
				animation: '',
				playing: false
			}
		}
	},

	__init__: function(_data){
		this.data = fn.combind({},this.data)
		// put the data into this.data
		fn.combind(this.data,_data)
	},

	update: function(_data){
		// put the data into this.data
		fn.combind(this.data,_data)
	}
})

Player = Class.$extend({
	sprite: null,
	data: null,

	__init__:function(_playerDataJson){
		this.sprite = game.engin.add.sprite(0, 0, _playerDataJson.sprite.image)

		//set up the animations
		this.sprite.animations.add('down',[0,1,2,3],10,true,true)
		this.sprite.animations.add('left',[4,5,6,7],10,true,true)
		this.sprite.animations.add('right',[8,9,10,11],10,true,true)
		this.sprite.animations.add('up',[12,13,14,15],10,true,true)

	    game.engin.physics.enable(this.sprite, Phaser.Physics.ARCADE);
	    this.sprite.body.setSize(20,18,6,30);

	    this.data = new PlayerData(_playerDataJson)
	    this.update(_playerDataJson)
	},
	update: function(_playerDataJson,dontSetXY){
		// update the this.data
		if(_playerDataJson){
			this.data.update(_playerDataJson)
		}

		if(!dontSetXY){
			this.sprite.position.x = this.data.data.position.body.x - this.sprite.body.offset.x
			this.sprite.position.y = this.data.data.position.body.y - this.sprite.body.offset.y
		}
		this.sprite.body.velocity.x = this.data.data.position.body.vx
		this.sprite.body.velocity.y = this.data.data.position.body.vy


		//update sprite
		if(this.sprite.animations.currentAnim.name != this.data.data.sprite.animations.animation || this.sprite.animations.currentAnim.isPlaying != this.data.data.sprite.animations.playing){
			this.sprite.animations.play(this.data.data.sprite.animations.animation)
			if(!this.data.data.sprite.animations.playing){
				this.sprite.animations.stop()
			}
		}

		// update the x/y
		this.data.update({
			position: {
				body: {
					x: this.sprite.body.position.x,
					y: this.sprite.body.position.y
				}
			}
		})

		return true
	},
	remove: function(){
		// remove the sprite
		this.sprite.destroy()

		// remove my self from the players array
		for (var i in game.players.players) {
			if(game.players.players[i].data.data.id.id == this.data.data.id.id){
				game.players.players.splice(i,1)
			}
		};
	}
});
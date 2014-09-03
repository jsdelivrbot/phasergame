PlayerData = Klass({
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
				y: 0
			},
			island: 0,
			map: 0
		},
		sprite: {
			image: 'player/1',
			animations: {
				animation: 'down',
				playing: false
			}
		}
	},

	initialize: function(_data){
		this.data = fn.duplicate(this.data)
		// put the data into this.data
		if(_data){
			fn.combind(this.data,_data)
		}
	},

	update: function(_data){
		// put the data into this.data
		fn.combind(this.data,_data)
	}
})

Player = Klass({
	sprite: null,
	data: null,

	initialize: function(_playerDataJson){
	    this.data = new PlayerData(_playerDataJson)

		this.sprite = game.engin.add.sprite(this.data.data.position.body.x, this.data.data.position.body.y, this.data.data.sprite.image)

		//set up the animations
		this.sprite.animations.add('down',[0,1,2,3],10,true,true)
		this.sprite.animations.add('left',[4,5,6,7],10,true,true)
		this.sprite.animations.add('right',[8,9,10,11],10,true,true)
		this.sprite.animations.add('up',[12,13,14,15],10,true,true)

	    game.engin.physics.enable(this.sprite, Phaser.Physics.ARCADE);
	    this.sprite.body.setSize(20,18,6,30);
	},
	step: function(){
		this.move()
		this.animate()
	},
	move: function(){
		// x
		if(Math.abs(this.data.data.position.body.x - this.sprite.position.x) < 200){
			if(this.data.data.position.body.x - this.sprite.position.x > 5){
				this.sprite.body.velocity.x = 175
				this.sprite.body.velocity.y = 0
			}
			else if(this.data.data.position.body.x - this.sprite.position.x < -5){
				this.sprite.body.velocity.x = -175
				this.sprite.body.velocity.y = 0
			}
			else{
				this.sprite.body.velocity.x = 0
			}
		}
		else{
			this.sprite.position.x = this.data.data.position.body.x
			this.sprite.position.y = this.data.data.position.body.y
		}
		// y
		if(Math.abs(this.data.data.position.body.y - this.sprite.position.y) < 200){
			if(this.data.data.position.body.y - this.sprite.position.y > 5){
				this.sprite.body.velocity.y = 175
				this.sprite.body.velocity.x = 0
			}
			else if(this.data.data.position.body.y - this.sprite.position.y < -5){
				this.sprite.body.velocity.y = -175
				this.sprite.body.velocity.x = 0
			}
			else{
				this.sprite.body.velocity.y = 0
			}
		}
		else{
			this.sprite.position.x = this.data.data.position.body.x
			this.sprite.position.y = this.data.data.position.body.y
		}
	},
	animate: function(){
		// up/down
		if(this.sprite.body.velocity.y > 0){
			this.sprite.animations.play('down')
		}
		else if(this.sprite.body.velocity.y < 0){
			this.sprite.animations.play('up')
		}

		// right/left
		if(this.sprite.body.velocity.x > 0){
			this.sprite.animations.play('right')
		}
		else if(this.sprite.body.velocity.x < 0){
			this.sprite.animations.play('left')
		}

		// nothing
		if(this.sprite.body.velocity.x == 0 && this.sprite.body.velocity.y == 0){
			// stoped
			this.sprite.animations.stop()
			return;
		}
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
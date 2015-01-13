PlayerDataFull = Klass({
	data: {
		id: {
			id: 0,
			name: '',
			email: '',
			password: ''
		},
		position: {
			body: {
				x: 0,
				y: 0
			},
			map: 0,
			loading: false
		},
		sprite: {
			image: 'player/1'
		}
	},

	initialize: function(_data){
		this.data = fn.duplicate(this.data);
		// put the data into this.data
		if(_data){
			this.update(_data)
		}
	},
	update: function(_data){
		// put the data into this.data
		if(_data instanceof PlayerData){
			this.updateFromPlayerData(_data)
		}
		else if(_data instanceof PlayerDataFull){
			this.updateFromPlayerDataFull(_data)
		}
		else{
			// json
			this.updateFromJSON(_data)
		}
	},
	updateFromJSON: function(_data){
		fn.combindOver(this.data,_data)
	},
	updateFromPlayerData: function(_playerData){
		fn.combindOver(this.data,_playerData.data);
	},
	updateFromPlayerDataFull: function(_playerDataFull){
		fn.combindOver(this.data,_playerDataFull.data);
	},
	toPlayerData: function(){
		return fn.combindOver(new PlayerData(),this.data);
	},
	toPlayerDataJSON: function(){
		return new PlayerData(this).data;
	}
})

PlayerData = Klass({
	data: {
		id: {
			id: 0,
			name: ''
		},
		health: 1000,
		position: {
			body: {
				x: 0,
				y: 0
			},
			map: 0
		},
		sprite: {
			image: 'player/1'
		}
	},

	initialize: function(_data){
		this.data = fn.duplicate(this.data);
		// put the data into this.data
		if(_data){
			this.update(_data)
		}
	},
	update: function(_data){
		// put the data into this.data
		if(_data instanceof PlayerData){
			this.updateFromPlayerData(_data)
		}
		else if(_data instanceof PlayerDataFull){
			this.updateFromPlayerDataFull(_data)
		}
		else{
			// json
			this.updateFromJSON(_data)
		}
	},
	updateFromJSON: function(_data){
		fn.combindIn(this.data,_data)
	},
	updateFromPlayerData: function(_playerData){
		fn.combindIn(this.data,_playerData.data);
	},
	updateFromPlayerDataFull: function(_playerDataFull){
		fn.combindIn(this.data,_playerDataFull.data);
	},
	toPlayerDataFull: function(){
		return new PlayerDataFull(this.data)
	},
	toPlayerDataFullJSON: function(){
		return new PlayerDataFull(this).data
	}
})

Player = Klass({
	sprite: null,
	data: null,
	textStyle: {
		font: "10px Arial", 
		fill: "#000000",
		align: "center"
	},

	// short hands
	id: 0,
	name: '',

	initialize: function(_playerDataJson){
	    this.data = new PlayerData(_playerDataJson)

		this.sprite = engin.add.sprite(this.data.data.position.body.x, this.data.data.position.body.y, this.data.data.sprite.image)

		//set up the animations
		this.sprite.animations.add('down',[0,1,2,3],10,true,true)
		this.sprite.animations.add('left',[4,5,6,7],10,true,true)
		this.sprite.animations.add('right',[8,9,10,11],10,true,true)
		this.sprite.animations.add('up',[12,13,14,15],10,true,true)

	    engin.physics.enable(this.sprite, Phaser.Physics.ARCADE);
	    this.sprite.body.setSize(20,18,6,30);
	    this.sprite.health = 1000;

	    // set up short hands
	    this.id = this.data.data.id.id
	    this.name = this.data.data.id.name

	    //add the name tag
	    this.sprite.addChild(new Phaser.Text(engin,0,-16,this.name,this.textStyle))
	},
	step: function(){
		this.move()
		this.animate()

		//check the sprite and see if its the same
		if(this.data.data.sprite.image !== this.sprite.key){
			//change sprite
			this.sprite.destroy();
			this.sprite = engin.add.sprite(this.data.data.position.body.x, this.data.data.position.body.y, this.data.data.sprite.image)

			//set up the animations
			this.sprite.animations.add('down',[0,1,2,3],10,true,true)
			this.sprite.animations.add('left',[4,5,6,7],10,true,true)
			this.sprite.animations.add('right',[8,9,10,11],10,true,true)
			this.sprite.animations.add('up',[12,13,14,15],10,true,true)

		    engin.physics.enable(this.sprite, Phaser.Physics.ARCADE);
		    this.sprite.body.setSize(20,18,6,30);

		    //add the name tag
		    this.sprite.addChild(new Phaser.Text(engin,0,-16,this.name,this.textStyle))
		}
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
	}
});
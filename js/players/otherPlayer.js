var OtherPlayer = function(data){
	this.userData = fn.duplicate(this.userData);
	this.inportData(data);
	this.createSprite();
}

OtherPlayer.constructor = OtherPlayer;
OtherPlayer.prototype = {
	sprite: undefined,
	userData: {
		id: -1,
		name: '',
		email: '',
		password: '',
		admin: '',
		banned: '',
		date_created: '',
		lastOn: '',
		health: 1000,
		image: 'player/1',
		map: 0,
		x: -1,
		y: -1
	},
	textStyle: fn.combindOver(fn.duplicate(fontSettings),{
		align: "center"
	}),
	nameTag: undefined,
	createSprite: function(){
		if(this.sprite){
			this.sprite.destroy();
		}
		this.sprite = engin.make.sprite(this.userData.x, this.userData.y, this.userData.image)
	   	this.sprite.name = this.userData.name;

		//set up the animations
		this.sprite.animations.add('down',[0,1,2,3],10,true,true)
		this.sprite.animations.add('left',[4,5,6,7],10,true,true)
		this.sprite.animations.add('right',[8,9,10,11],10,true,true)
		this.sprite.animations.add('up',[12,13,14,15],10,true,true)

		//body
	    engin.physics.enable(this.sprite, Phaser.Physics.ARCADE);
	    this.sprite.body.setSize(20,18,6,30);

	    //add the name tag
	    this.nameTag = engin.add.text(0,0,this.name,this.textStyle);
	    this.nameTag.name = this.userData.name;
	    this.nameTag.anchor.y = 1;
	   	players.nameTags.add(this.nameTag);

	   	//add to the players group
	   	players.group.add(this.sprite);
	},
	update: function(){ //step event for player
		this.move();

		//check the sprite and see if its the same
		if(this.userData.image !== this.sprite.key){
			this.createSprite();
		}

		this.updateAnimation();

		this.nameTag.position.copyFrom(this.sprite.position);
	},
	move: function(){ //moves the players sprite
		//move the sprite to the userData
		// x
		if(Math.abs(this.userData.x - this.sprite.position.x) < 200){
			if(this.userData.x - this.sprite.position.x > 5){
				this.sprite.body.velocity.x = 175
				this.sprite.body.velocity.y = 0
			}
			else if(this.userData.x - this.sprite.position.x < -5){
				this.sprite.body.velocity.x = -175
				this.sprite.body.velocity.y = 0
			}
			else{
				this.sprite.body.velocity.x = 0
			}
		}
		else{
			this.sprite.position.x = this.userData.x
			this.sprite.position.y = this.userData.y
		}
		// y
		if(Math.abs(this.userData.y - this.sprite.position.y) < 200){
			if(this.userData.y - this.sprite.position.y > 5){
				this.sprite.body.velocity.y = 175
				this.sprite.body.velocity.x = 0
			}
			else if(this.userData.y - this.sprite.position.y < -5){
				this.sprite.body.velocity.y = -175
				this.sprite.body.velocity.x = 0
			}
			else{
				this.sprite.body.velocity.y = 0
			}
		}
		else{
			this.sprite.position.x = this.userData.x
			this.sprite.position.y = this.userData.y
		}
	},
	updateAnimation: function(){ //updates the sprites animation
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
	inportData: function(data){
		fn.combindOver(this.userData,data);

		if(this.nameTag){
			this.nameTag.text = this.name;
		}
	},
	exportData: function(){
		return this.userData;
	},
	remove: function(dontRemove){
		if(this.sprite){
			this.sprite.destroy();
		}
		if(this.nameTag){
			this.nameTag.destroy();
		}

		if(!dontRemove){
			players.removePlayer(this.id);
		}
	}
}

for (var i in OtherPlayer.prototype.userData) {
	OtherPlayer.prototype.__defineGetter__(i,_.partial(function(i){
		return this.userData[i];
	},i));

	OtherPlayer.prototype.__defineSetter__(i,_.partial(function(i,val){
		this.userData[i] = val;
		this.inportData();
		return val;
	},i));
};
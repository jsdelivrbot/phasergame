var Player = function(data){
	this.userData = fn.duplicate(this.userData);
	this.inportData(data);
	this.createSprite();
}

Player.constructor = Player;
Player.prototype = fn.duplicate(OtherPlayer.prototype);

//overwrites
Player.prototype.move = function(){
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
    
    map.collide(this.sprite);

	//update userData
	this.userData.x = this.sprite.position.x;
	this.userData.y = this.sprite.position.y;

	//set the position of the camera
	switch(page.menu.settings.graphics.cameraMode.peek()){
		case 'none':
			x = this.sprite.x - (engin.width/2)
			y = this.sprite.y - (engin.height/2)
			break;
		case 'dynamic':
			mx = engin.input.mousePointer.realPageX * (engin.width / window.innerWidth)
			my = engin.input.mousePointer.realPageY * (engin.height / window.innerHeight)

			mx = (mx < (engin.width/5))? (engin.width/5) : mx;
			my = (my < (engin.height/5))? (engin.height/5) : my;

			mx = (mx > engin.width-(engin.width/5))? engin.width-(engin.width/5) : mx;
			my = (my > engin.height-(engin.height/5))? engin.height-(engin.height/5) : my;

			x = this.sprite.x - (engin.width/2) + ((mx - (engin.width/2)) / 3)
			y = this.sprite.y - (engin.height/2) + ((my - (engin.height/2)) / 3)
		break;
		case 'smooth':
			if((this.sprite.x - (engin.width/2)) - engin.camera.x < engin.width/2){
				x = engin.camera.x + (((this.sprite.x - (engin.width/2)) - engin.camera.x) / page.menu.settings.graphics.cameraSmoothSpeed.peek())
			}
			else{
				x = this.sprite.x - (engin.width/2)
			}
			if((this.sprite.y - (engin.height/2)) - engin.camera.y < engin.height/2){
				y = engin.camera.y + (((this.sprite.y - (engin.height/2)) - engin.camera.y) / page.menu.settings.graphics.cameraSmoothSpeed.peek())
			}
			else{
				y = this.sprite.y - (engin.height/2)
			}
			break;
	}

	engin.camera.setPosition(x,y)

	//map
	if(this.userData.map !== map.loadedMapID){
		//load new map
		if(this.sprite) this.sprite.alpha = 0;

		map.loadMap(this.userData.map,function(){
			if(this.sprite) engin.add.tween(this.sprite).to( { alpha: 1 }, 500, "Linear", true);
		}.bind(this));
	}
}

Player.prototype.inportData = function(data){
	fn.combindOver(this.userData,data);

	//update my position
	if(this.sprite){
		this.sprite.position.x = this.userData.x;
		this.sprite.position.y = this.userData.y;
	}
}

for (var i in Player.prototype.userData) {
	Player.prototype.__defineGetter__(i,_.partial(function(i){
		return this.userData[i];
	},i));

	Player.prototype.__defineSetter__(i,_.partial(function(i,val){
		this.userData[i] = val;
		this.inportData();
		return val;
	},i));
};
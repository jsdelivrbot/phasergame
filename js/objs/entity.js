Entity = Class.$extend({
	sprite: null,
	data: null,

	__init__:function(_entityData){
		this.sprite = game.engin.add.sprite(0, 0, _entityData.sprite.image)

		//set up the animations
		this.sprite.animations.add('down',[0,1,2,3],10,true,true)
		this.sprite.animations.add('left',[4,5,6,7],10,true,true)
		this.sprite.animations.add('right',[8,9,10,11],10,true,true)
		this.sprite.animations.add('up',[12,13,14,15],10,true,true)

	    game.engin.physics.enable(this.sprite, Phaser.Physics.ARCADE);
	    this.sprite.body.setSize(20,18,6,30);

	    this.update(_entityData)
	},
	update: function(_entityData){
		if(!_entityData){
			return false
		}

		this.data = _entityData

		this.sprite.position.x = _entityData.position.x || 0
		this.sprite.position.y = _entityData.position.y || 0

		//update sprite
		if(this.sprite.animations.currentAnim != _entityData.sprite.animations.animation){
			if(this.sprite.animations.getAnimation(_entityData.sprite.animations.animation)){
				this.sprite.animations.play(_entityData.sprite.animations.animation)
			}
			else{
				this.sprite.animations.stop()
			}
		}

		return true
	},
	getData: function(){
		data = {
			position:{
				x: this.data.position.x,
				y: this.data.position.y,
				island: this.data.position.island,
				map: this.data.position.map
			},
			sprite: {
				image: this.data.sprite.image,
				animations: {
					animation: this.data.sprite.animations.animation
				}
			}
		}

		data.position.x = this.sprite.body.position.x
		data.position.y = this.sprite.body.position.y

		data.sprite.animations.paused = this.sprite.animations.paused
		data.sprite.animations.animation = this.sprite.animations.currentAnim.name

		return data
	}
});

/*
entity data
{
	--id data is instered by ther server--
	id: {
		name: string,
		id: number
	},
	position:{
		x: number,
		y: number,
		island: number,
		map: number
	},
	sprite: {
		image: string,
		animations: {
			animation: string
		}
	}
}
*/
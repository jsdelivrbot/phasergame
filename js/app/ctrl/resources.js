/*
resource format
{
	id: '',
	resourceID: this is the id in resources.json
	amount: number,
	mined: false,
	position: {
		map: mapID,
		x: in tiles,
		y: in tiles,
	},
	size: {
		w: in pixels
		h: in pixels
	}
	obj: only on client side
	resrImage: image obj
}
*/

maps.resources = {
	resources: {},
	removeAll: function(){
		for(var i in this.resources){
			this.resources[i].destroy();
		}
		this.resources = {};
	},
	serverIn: function(data){
		switch(data.type){
			case 'resources': //server sent the resources for the map
				this.removeAll();
				for(var i = 0; i < data.resources.length; i++){
					this.resources[data.resources[i].id] = new maps.resource(data.resources[i]);
				}
				break;
			case 'change': //a resource changed
				//find the resource
				resr = this.find(data.resource.id)[0];
				if(resr){
					resr.change(data.resource);
				}
				break;
		}
	},
	loadMap: function(mapID,cb){
		server.out.resources.data({
			type: 'map',
			map: mapID
		},function(resr){
			this.removeAll();
			for(var i = 0; i < resr.length; i++){
				this.resources[resr[i].id] = new maps.resource(resr[i]);
			}
			if(cb) cb();
		}.bind(this))
	},
	find: function(str){
		a = [];
		for(var i in this.resources){
			s = i.indexOf(str)
			if(s !== -1){
				a.push(this.resources[i]);
			}
		}
		return a;
	},
	mining: {
		timer: null,
		resource: null,
		tick: function(time, ticks, cb, ctime){
			ctime = ctime || 0;
			if(ctime < time){
				t = (1000*time) / ticks;
				f = maps.resources.mining.tick.bind(this,time,ticks,cb,ctime+time/ticks);
				maps.resources.mining.timer = setTimeout(f,t);
			}
			if(cb) cb(ctime/time);
		}
	},
	key: {
		down: function(){
			//find the closest resources and start mining on it
			dist = 48
			for(var i in this.resources){
				d = engin.physics.arcade.distanceBetween(game.players.player.sprite, this.resources[i].obj)
			 	if(d < dist && !this.resources[i].mined){
			 		dist = d;
			 		this.mining.resource = this.resources[i];
			 		break;
			 	}
			}

			if(this.mining.resource){
				//start the timer
				t = server.data.resources[this.mining.resource.resourceID].time
				this.mining.tick(t,t,function(t){
					if(engin.physics.arcade.distanceBetween(game.players.player.sprite,this.mining.resource.obj) >= 45){
						clearTimeout(this.mining.timer);
						this.mining.resource.mine.bind(this.mining.resource)(0);
					}
					else{
						this.mining.resource.mine.bind(this.mining.resource)(t);
					}
				}.bind(this))
			}
		},
		up: function(){
			if(this.mining.resource){
				clearTimeout(this.mining.timer);
				this.mining.resource.mine(0);
				this.mining.resource = null;
				this.mining.timer = null;
			}
		}
	},
	update: function(){ //update the resources
		for(var i in this.resources){
			this.resources[i].update();
		}
	}
}

maps.resource = function(data){
	this.change = function(data){
		this.mined = data.mined;
		this.resourceID = data.resourceID;
		this.amount = data.amount;
		if(this.resrImage.key !== 'imgs/item/'+server.data.resources[this.resourceID].itemID){
			//change the resrImage
			this.resrImage.destroy()
			this.resrImage = engin.make.image(0,-32,'imgs/item/'+server.data.resources[this.resourceID].itemID)
			this.resrImage.width = 32;
			this.resrImage.height = 32;

			this.obj.addChild(this.resrImage);
		}
		this.resrAmount.text = String(this.amount);
	}
	this.update = function(){ //see if the player is close enough to show the resource
		close = engin.physics.arcade.distanceBetween(game.players.player.sprite,this.obj) < 45;
		this.resrImage.visible = close && !this.mined;
		this.resrAmount.visible = close && !this.mined;
	}
	this.destroy = function(){
		if(this.obj){
			this.obj.destroy(true); //since this.resr* are childen they are destroyed
		}
	}
	this.mine = function(precent){
		this.resrProgress.width = 32*precent;

		if(precent == 1){
			//tell the server that we got mined
			server.out.resources.data({
				type: 'mine',
				id: this.id
			},function(mined){
				//player mined sound
			})
			this.resrProgress.width = 0;
		}
	}

	this.id = data.id;
	this.resourceID = data.resourceID;
	this.position = data.position;
	this.size = data.size;
	this.amount = data.amount;
	this.mined = data.mined;

	img = 'blank';
	if(!this.mined && server.data.resources[this.resourceID].image){
		// img = set image to whatever the image id is for the resources
	}
	this.obj = engin.add.image(this.position.x,this.position.y,img);
	this.obj.width = this.size.width;
	this.obj.height = this.size.height;

	this.resrImage = engin.make.image(0,-32,'imgs/item/'+server.data.resources[this.resourceID].itemID)
	this.resrImage.width = 32;
	this.resrImage.height = 32;

	this.obj.addChild(this.resrImage);


	this.resrAmount = engin.make.text(0,-16,this.amount,{font: "16px"})

	this.obj.addChild(this.resrAmount);


	this.resrProgress = engin.make.image(0,-4,'progress')
	this.resrProgress.width = 0;
	this.resrProgress.height = 2;
	this.obj.addChild(this.resrProgress);

}
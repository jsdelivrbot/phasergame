Players = Klass({
	player: null,
	players: {},

	initialize:function(){
		
	},

	createPlayer: function(_playerData){
		this.player = new PlayerControl(_playerData)

		game.loadMap(_playerData.position.map, function(){
			//see if we are off the map or at spawn
			p = game.players.player.data.data.position.body
			if(p.x + p.y === 0){
				//send us to spawn
				game.players.player.jumpTo(game.map.properties.spawnX * game.map.tileWidth,game.map.properties.spawnY * game.map.tileHeight)
			}
			else if(p.x < 0 || p.x > game.map.width * game.map.tileWidth || p.y < 0 || p.y > game.map.height * game.map.tileHeight){
				//send us to spawn
				game.players.player.jumpTo(game.map.properties.spawnX * game.map.tileWidth,game.map.properties.spawnY * game.map.tileHeight)
			}
		})
	},

	step: function(){
		for (var i in this.players) {
			this.players[i].step()
		};

		if(this.player){
			this.player.step()

			//set the position of the camera
			switch(page.menu.settings.graphics.cameraMode.peek()){
				case 'none':
					x = this.player.sprite.x - (engin.width/2)
					y = this.player.sprite.y - (engin.height/2)
					break;
				case 'dynamic':
					mx = engin.input.mousePointer.realPageX * (engin.width / window.innerWidth)
					my = engin.input.mousePointer.realPageY * (engin.height / window.innerHeight)

					mx = (mx < (engin.width/5))? (engin.width/5) : mx;
					my = (my < (engin.height/5))? (engin.height/5) : my;

					mx = (mx > engin.width-(engin.width/5))? engin.width-(engin.width/5) : mx;
					my = (my > engin.height-(engin.height/5))? engin.height-(engin.height/5) : my;

					x = this.player.sprite.x - (engin.width/2) + ((mx - (engin.width/2)) / 3)
					y = this.player.sprite.y - (engin.height/2) + ((my - (engin.height/2)) / 3)
				break;
				case 'smooth':
					if((this.player.sprite.x - (engin.width/2)) - engin.camera.x < engin.width/2){
						x = engin.camera.x + (((this.player.sprite.x - (engin.width/2)) - engin.camera.x) / page.menu.settings.graphics.cameraSmoothSpeed.peek())
					}
					else{
						x = this.player.sprite.x - (engin.width/2)
					}
					if((this.player.sprite.y - (engin.height/2)) - engin.camera.y < engin.height/2){
						y = engin.camera.y + (((this.player.sprite.y - (engin.height/2)) - engin.camera.y) / page.menu.settings.graphics.cameraSmoothSpeed.peek())
					}
					else{
						y = this.player.sprite.y - (engin.height/2)
					}
					break;
			}

			engin.camera.setPosition(x,y)
		}
	},

	sendData: function(data){
		if(this.player){
			server.out.player.data(data)
			ko.mapping.fromJS({
				menu: {
					profile: {
						playerData: data
					}
				}
			},page);
			server.in.player.data = fn.duplicate(data)
		}
	},

	update: function(){
		// remove the players that are not there
		for (var i in this.players) {
			if(!server.in.players.data[this.players[i].data.data.id.id]){
				this.players[i].remove()
				delete this.players[i];
			}
		};

		//update the players based on what the servers data is
		for (var i in server.in.players.data) {
			if(this.players[server.in.players.data[i].id.id]){
				this.players[server.in.players.data[i].id.id].data.update(server.in.players.data[i])
			}
			else{
				this.players[server.in.players.data[i].id.id] = new Player(server.in.players.data[i])
				this.fixPlayersLevels()
			}
		};
	},

	destroyAll: function(){
		for (var i = 0; i < this.players.length; i++) {
			this.players[i].remove();
		};
		if(this.player){
			this.player.remove();
		}
	},

	fixPlayersLevels: function(){
		this.player.sprite.bringToTop()
		for (var i in this.players) {
			this.players[i].sprite.bringToTop()
		};
		if(game.layers.layer4){
			game.layers.layer4.bringToTop()
		}
	}
})

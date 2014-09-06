Players = Klass({
	player: null,
	players: [],

	initialize:function(){
		
	},

	createPlayer: function(_playerData){
		console.log(_playerData)

		this.player = new PlayerControl(_playerData)

		game.engin.camera.follow(this.player.sprite)
		game.engin.camera.deadzone = new Phaser.Rectangle(302.5,225,195,150)

		game.loadMap(_playerData.position.island,_playerData.position.map)
	},

	step: function(){
		for (var i in this.players) {
			this.players[i].step()
		};

		if(this.player){
			this.player.step()

			game.server.out.update.data(this.player.data.data)
		}
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
				this.players[game.server.in.players.data[i].id.id].data.update(game.server.in.players.data[i])
			}
			else{
				this.players[game.server.in.players.data[i].id.id] = new Player(game.server.in.players.data[i])
				this.fixPlayersLevels()
			}
		};
	},
	fixPlayersLevels: function(){
		this.player.sprite.bringToTop()
		for (var i in this.players) {
			this.players[i].sprite.bringToTop()
		};
		game.layers.layer4.bringToTop()
	}
})
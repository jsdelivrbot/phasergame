lastPosition = {};
players = {
	players: new SortedArray([],function(a,b){
		if(a.id === b.id) return 0;
		if(a.id < b.id){
			return -1;
		}
		else{
			return 1;
		}
	}),
	player: undefined,
	group: undefined,
	nameTags: undefined,

	init: function(){ //called when engin starts
		this.sendPlayerPositionLoop();

		this.group = engin.make.group(engin.world,'players');
		engin.world.addAt(this.group,1);

		this.nameTags = engin.add.group(abovePlayerGroup,'playersNameTags');
	},
	getPlayer: function(playerID){
		if(this.players.indexOf({id: playerID}) !== -1){
			return this.players[this.players.indexOf({id: playerID})];
		}
	},
	removePlayer: function(playerID){
		var player = this.players.indexOf({id: playerID});
		if(player !== -1){
			this.players[player].remove(true);
			this.players.splice(player,1);
		}
	},
	step: function(){
		for (var i = 0; i < this.players.length; i++) {
			this.players[i].update();
		};

		if(this.player){
			this.player.update();
		}
	},
	updateUserData: function(data){
		if(this.player){
			this.player.inportData(data);
		}
		else{
			//create player
			this.player = new Player(data);
		}
	},
	updatePlayers: function(data){ //handles data from the server
		var updatedPlayers = [];

		for (var i = 0; i < data.length; i++) {
			var player = this.getPlayer(data[i].id);
			if(player){
				//update player
				player.inportData(data[i]);
				updatedPlayers[player.id] = true;
			}
			else{
				//create new player
				player = new OtherPlayer(data[i]);
				this.players.push(player);
				updatedPlayers[player.id] = true;
			}
		};

		//loop through players and remove the ones that where not updated
		for (var i = 0; i < this.players.length; i++) {
			if(updatedPlayers[this.players[i].id] !== true){
				this.players[i].remove();
			}
		};

		//sort the players
		this.group.sort('y',Phaser.Group.SORT_ASCENDING)
	},
	sendPlayerPositionLoop: function(){
		if(this.player){
			//see if the position has changed
			if(lastPosition.x !== this.player.x || lastPosition.y !== this.player.y || lastPosition.map !== this.player.map){
				lastPosition.x = this.player.x;
				lastPosition.y = this.player.y;
				lastPosition.map = this.player.map;

				server.emit('updatePosition',{
					x: this.player.x,
					y: this.player.y,
					map: this.player.map
				})
			}
		}

		setTimeout(this.sendPlayerPositionLoop.bind(this),100);
	}
}
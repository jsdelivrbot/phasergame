//engin events
function create(){
	engin.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	
	//set up
	engin.time.advancedTiming = true
	engin.physics.startSystem(Phaser.Physics.ARCADE);

	//set up the settings
	engin.sound.mute = page.menu.settings.sound.mute();
	engin.sound.volume = page.menu.settings.sound.volume();

	//sound
	sound.background.start();

	// bind the keys
	keyBindings.bindKeys()

	engin.plugins.add(Phaser.Plugin.Debug);

	//resize the engin to fit the screen
	$(window).trigger('resize')
}
function update(){
	if(game.active){
		game.step()
	}
}
function render(){
	if(game.active){
		engin.debug.text('fps: '+engin.time.fps,16,16)
		if(game.players.player){
			engin.debug.text('health: '+game.players.player.sprite.health,16,32)
		}
	}
}

game = {
	active: false,

	map: null,
	layers: {
		ground: null,
		col: null,
		layer2: null,
		layer3: null,
		layer4: null,
		doors: null
	},

	timers: {
		sendPlayerData: -1,
	},

	players: new Players(),

	//engin events
	step: function(){
		//see if im active
		if(game.active){
			//send updates to controlers/objs that need it
			game.players.step();
			maps.resources.update();
		}
	},

	//clear canvas and start the game state
	enter: function(){
		if(game.active){
			return;
		}

		game.active = true;

		game.players.createPlayer(server.in.player.data);

		//turn the keyboard on
		keyBindings.enable('game')

		f = _(game.players.sendData).bind(game.players,game.players.player.data.data)
		game.timers.sendPlayerData = window.setInterval(f,100)
	},

	//clear canvas and end game state
	exit: function(){
		if(!game.active){
			return;
		}

		game.active = false;
		//tell players to get rid of all players
		game.players.destroyAll();

		maps.destroyMap();

		//timers
		window.clearInterval(game.timers.sendPlayerData);
	}
}
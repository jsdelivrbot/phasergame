page = {
	connect: {
		serverIp: ko.observable('127.0.0.1:8181'),
		connect: function(){
			// socket = new Socket($("#server-ip").val())
			server.connect(this.serverIp(),function(){
				$("#login-module").foundation('reveal', 'open')
			},function(){
				$("#connect-module").foundation('reveal', 'open')
			})
		}
	},
	login: {
		email: ko.observable('account1@gmail.com'),
		password: ko.observable('password'),
		login: function(){
			server.login(this.email(),this.password(),function(data){
				if(data){
					console.log('logged in')
					$("#login-module").foundation('reveal', 'close')
					startGame(data)
				}
				else{
					console.log('failed')
				}
		 	})
		}
	},
	chat: {
		activeChanel: ko.mapping.fromJS({
			chanel: null,
			id: -1,
			title: '',
			owner: 0,
			own: false,
			canLeave: true,
			newMessage: false,
			players: [],
			messages: []
		}),
		activeChanelPlayers: ko.observableArray([]),
		activeChanelOwn: ko.observable(false),
		chanels: ko.observableArray([]),
		open: function(id){
			for (var i = 0; i < this.chanels().length; i++) {
				if(this.chanels()[i].id == id){
					ko.mapping.fromJS(page.chat.chanels()[i],page.chat.activeChanel)

					page.chat.activeChanel.chanel(page.chat.chanels()[i])

					// see if i own it
					if(game){
						page.chat.activeChanel.own(page.chat.activeChanel.owner() == game.players.player.data.data.id.id)
					}
					break;
				}
			};
		},
		create: function(event){
			server.out.chat.data({
				type: 'create',
				title: $("#chat-new-title").val(),
				players: [],
			})
			$("#chat-new-title").val('')
		},
		update: function(event){
			ko.mapping.fromJS(this.activeChanel.chanel(),page.chat.activeChanel)

			// see if i own it
			page.chat.activeChanel.own(page.chat.activeChanel.owner() == game.players.player.data.data.id.id)
		},
		invite: function(){
			if($("#chat-invite-name").val().length){
				server.out.chat.data({
					type: 'invite',
					chanel: page.chat.activeChanel.id(),
					player: $("#chat-invite-name").val()
				})
				$("#chat-invite-name").val('')
			}
		},
		close: function(){
			server.out.chat.data({type: 'leave',chanel: page.chat.activeChanel.id()})
		},
		leave: function(){
			server.out.chat.data({type: 'leave',chanel: page.chat.activeChanel.id()})
		},

		// in-comming events
		youJoined: function(data){
			// add the chanel
			this.chanels.push({
				id: data.chanel.id,
				title: data.chanel.title,
				owner: data.chanel.owner,
				canLeave: data.chanel.canLeave,
				newMessage: false,
				messages: [],
				players: data.players
			})

			if(!this.activeChanel.chanel()){
				this.open(0)
			}
		},
		joined: function(data){
			// add the player
			for (var i = 0; i < this.chanels().length; i++) {
				if(this.chanels()[i].id == data.chanel){
					this.chanels()[i].players.push(data.player)
					
					if(this.activeChanel.id() == this.chanels()[i].id){
						this.update()
					}
					break;
				}
			};
		},
		message: function(data){
			// add the message
			for (var i = 0; i < this.chanels().length; i++) {
				if(this.chanels()[i].id == data.chanel){
					this.chanels()[i].messages.unshift({
						player: data.player.name,
						message: data.message
					})

					// see if we should remove some of the messages from the bottom of the array
					if(this.chanels()[i].messages.length > 100){
						this.chanels()[i].messages.length = 100
					}

					if(this.activeChanel.id() == this.chanels()[i].id){
						this.update()
					}
					break;
				}
			};
		},
		left: function(data){
			// remove the player
			for (var i = 0; i < this.chanels().length; i++) {
				if(this.chanels()[i].id == data.chanel){
					for (var j = 0; j < this.chanels()[i].players.length; j++) {
						if(this.chanels()[i].players[j].id == data.player){
							this.chanels()[i].players.splice(j,1)
						}
					};

					if(this.activeChanel.id() == this.chanels()[i].id){
						this.update()
					}
					break;
				}
			};
		},
		youLeft: function(data){
			// find the chanel
			for (var i = 0; i < this.chanels().length; i++) {
				if(this.chanels()[i].id == data.chanel){
					// see if its the one that open
					if(this.activeChanel.id() == this.chanels()[i].id){
						this.open(0)
					}
					this.chanels.splice(i,1)
					break;
				}
			};
		},
		closed: function(data){
			// find the chanel
			for (var i = 0; i < this.chanels().length; i++) {
				if(this.chanels()[i].id == data.chanel){
					// see if its the one that open
					if(this.activeChanel.id() == this.chanels()[i].id){
						this.open(0)
					}
					this.chanels.splice(i,1)
					break;
				}
			};
		},
	},
	player: {
		data: ko.mapping.fromJS(new PlayerDataFull().data),
		update: {
			up: function(){
				// pulls data from game.players.player.data.data
			},
			down: function(){

			}
		}
	}
}
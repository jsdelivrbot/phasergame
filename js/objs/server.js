ServerOut = Klass({
	name: '',
	socket: null,
	initialize: function(name){
		this.name = name
	},
	data: function(data){
		if(this.socket){
			this.socket.emit(this.name,data)
		}
	},
	bind: function(socket){
		this.socket = socket
	}
})

ServerIn = Klass({
	name: '',
	callback: null,
	data: {},
	initialize: function(name,callback){
		this.name = name || ''
		this.callback = callback
	},
	bind: function(socket){
		if(this.callback){
			socket.on(this.name,this.callback)
		}
	}
})

ServerOutCache = ServerOut.extend({
	_data: null,
	changed: false,
	initialize: function(name,timing){
		this.supr(name)

		window.setInterval(this.test,timing,this)
	},
	data: function(data){
		if(JSON.stringify(data) !== JSON.stringify(this._data)){
			this._data = fn.duplicate(data)
			this.changed = true
		}
	},
	test: function(_this){
		if(_this.changed){
			_this.send(_this._data)
		}
	},
	send: function(data){
		if(this.socket){
			this.socket.emit(this.name,data)
			this.changed = false
		}
	}
})

Server = Klass({
	//data from the server is stored here
	in: {
		players: new ServerIn('players',function(data){
			server.in.players.data = data

			game.players.update()
		}),
		chat: new ServerIn('chat',function(data){
			switch(data.type){
				case 'you joined': 
					// add the chanel
					page.chat.chanels.push({
						id: data.chanel.id,
						title: data.chanel.title,
						owner: data.chanel.owner,
						canLeave: data.chanel.canLeave,
						newMessage: false,
						messages: [],
						players: data.players
					})

					if(!page.chat.activeChanel.chanel()){
						page.chat.open(0)
					}
					break;
				case 'joined':
					// add the player
					for (var i = 0; i < page.chat.chanels().length; i++) {
						if(page.chat.chanels()[i].id == data.chanel){
							page.chat.chanels()[i].players.push(data.player)
							
							if(page.chat.activeChanel.id() == page.chat.chanels()[i].id){
								page.chat.update()
							}
							break;
						}
					};
					break;
				case 'message':
					// add the message
					for (var i = 0; i < page.chat.chanels().length; i++) {
						if(page.chat.chanels()[i].id == data.chanel){
							page.chat.chanels()[i].messages.unshift({
								player: data.player.name,
								message: data.message
							})

							// see if we should remove some of the messages from the bottom of the array
							if(page.caht.chanels()[i].messages.length > 100){
								page.caht.chanels()[i].messages.length = 100
							}

							if(page.chat.activeChanel.id() == page.chat.chanels()[i].id){
								page.chat.update()
							}
							break;
						}
					};
					break;
				case 'left':
					// remove the player
					for (var i = 0; i < page.chat.chanels().length; i++) {
						if(page.chat.chanels()[i].id == data.chanel){
							for (var j = 0; j < page.chat.chanels()[i].players.length; j++) {
								if(page.chat.chanels()[i].players[j].id == data.player){
									page.chat.chanels()[i].players.splice(j,1)
								}
							};

							if(page.chat.activeChanel.id() == page.chat.chanels()[i].id){
								page.chat.update()
							}
							break;
						}
					};
					break;
				case 'you left':
					// find the chanel
					for (var i = 0; i < page.chat.chanels().length; i++) {
						if(page.chat.chanels()[i].id == data.chanel){
							// see if its the one that open
							if(page.chat.activeChanel.id() == page.chat.chanels()[i].id){
								page.chat.open(0)
							}
							page.chat.chanels.splice(i,1)
							break;
						}
					};
					break;
				case 'closed':
					// find the chanel
					for (var i = 0; i < page.chat.chanels().length; i++) {
						if(page.chat.chanels()[i].id == data.chanel){
							// see if its the one that open
							if(page.chat.activeChanel.id() == page.chat.chanels()[i].id){
								page.chat.open(0)
							}
							page.chat.chanels.splice(i,1)
							break;
						}
					};
					break;
			}
		}),
	},
	out: {
		update: new ServerOutCache('update',100),
		chat: new ServerOut('chat')
	},
	socket: null,

	connect: function(url,connect,disconnect){
		if(!this.socket){
			this.socket = new io(url)

			//set up events
			this.socket.on('connect',connect)
			this.socket.on('disconnect',disconnect)

			for (var index in this.in) {
				this.in[index].bind(this.socket)
			};
			for (var index in this.out) {
				this.out[index].bind(this.socket)
			};
		}
	},

	login: function(email,password,callback){
		if(this.socket){
			this.socket.emit('login',{email:email,password:password},function(data){
				if(data){
					//start the game
					game = new Game(engin,server)
					game.players.createPlayer(data)
				}

				if(callback){
					callback(data)
				}
			})
			return true
		}
		else{
			return false
		}
	},

	logout: function(callback){
		if(this.socket){

		}
		else{
			return false
		}
	}
})
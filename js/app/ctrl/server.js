ServerIn = Klass({
	name: '',
	callback: null,
	data: {},
	initialize: function(name,callback,value){
		this.name = name || ''
		this.callback = callback
		this.data = fn.duplicate(this.data);
		if(value){
			this.data = fn.duplicate(value);
		}
	},
	bind: function(socket){
		if(this.callback){
			f = _.partial(function(_this,callback,data){
				_this.data = data;
				callback = _.bind(callback,this);
				callback(data);
			},this,this.callback)
			socket.on(this.name,f)
		}
	},
	unbind: function(){
		//nothing to do right now
	}
})

ServerInDiff = ServerIn.extend({
	bind: function(socket){
		if(this.callback){
			f = _.partial(function(_this,callback,diff){
				fn.applyDiff(_this.data,diff);
				callback = _.bind(callback,this);
				callback(diff); 
			},this,this.callback)
			socket.on(this.name,f)
		}
	}
})

ServerOut = Klass({
	name: '',
	socket: null,
	initialize: function(name){
		this.name = name
	},
	data: function(data,callback){
		if(this.socket){
			this.socket.emit(this.name,data,callback)
		}
	},
	bind: function(socket){
		this.socket = socket
	},
	unbind: function(){
		this.socket = null
	}
})

ServerOutCache = ServerOut.extend({
	_data: null,
	changed: false,
	initialize: function(name,timing){
		this.supr(name)
		this._data = fn.duplicate(this._data);

		window.setInterval(this.test,timing,this)
	},
	data: function(data){
		if(JSON.stringify(data) !== JSON.stringify(this._data)){
			this._data =  fn.duplicate(data);
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

ServerOutDiff = ServerOut.extend({
	_data: {},
	initialize: function(name){
		this.supr(name)
		this._data = fn.duplicate(this._data);
	},
	data: function(data,callback){
		if(this.socket){
			var diff = fn.getDiff(this._data,data)
			if(!fn.isEmptyDiff(diff)){
				this.socket.emit(this.name,diff,callback)
				this._data = fn.duplicate(data);
			}
		}
	}
})

server = {
	//data from the server is stored here
	in: {
		player: new ServerInDiff('player', function(diff){
			//build the diff
			data = fn.buildDiff(diff);
			//update the interface
			ko.mapping.fromJS({
				menu: {
					profile: {
						playerData: data
					}
				}
			},page);
			//update the server out, but with out pushing it to the server
			fn.applyDiff(server.out.player._data,diff);
		}),
		players: new ServerIn('players',function(data){
			game.players.update()
		}),
		chat: new ServerIn('chat',function(data){
			switch(data.type){
				case 'you joined': 
					page.chat.youJoined(data)
					break;
				case 'joined':
					page.chat.joined(data)
					break;
				case 'message':
					page.chat.message(data)
					break;
				case 'left':
					page.chat.left(data)
					break;
				case 'you left':
					page.chat.youLeft(data)
					break;
				case 'closed':
					page.chat.closed(data)
					break;
			}
		}),
		inventory: new ServerInDiff('inventory',function(diff){
			//update the inventory
			ko.mapping.fromJS({
				menu: {
					inventory: {
						data: server.in.inventory.data
					}
				}
			},page);
			// page.menu.inventory.data(server.in.inventory.data);
			fn.applyDiff(server.out.inventory._data,diff);
		},[]),
		attack: new ServerIn('attack',function(data){
			switch(data.type){
				case 'health':
					//set my health
					if(game.players.player){
						game.players.player.sprite.health = data.health
					}
					break;
				case 'damage':
					//got hit, set health to what was sent
					if(game.players.player){
						game.players.player.sprite.health = data.health;
						game.players.player.sprite.damage(0);
					}
					break;
				case 'respawn':
					//revive the player and put him at the point sent by the server
					if(game.players.player){
						game.players.player.sprite.revive(data.health);
					}
					break;
			}
		}),
		resources: new ServerIn('resources',function(data){
			maps.resources.serverIn(data);
		})
	},
	out: {
		player: new ServerOutDiff('player'),
		chat: new ServerOut('chat'),
		inventory: new ServerOutDiff('inventory'),
		attack: new ServerOut('attack'),
		resources: new ServerOut('resources')
	},
	data: { //where all the shared files go when parsed

	},
	options: {
		reconnection: false,
		forceNew: true
	},
	socket: null,
	url: fn.parseURL(''),

	connect: function(url){
		url = url.replace('http://','')
		url = url.replace('https://','')
		url = url.replace('www.','')
		url = 'http://'+url;

		this.socket = new io(url+':8181',server.options)

		//set up events
		this.socket.on('connect',_(this.connectEvent).bind(this,url))
		this.socket.on('disconnect',this.disconnectEvent)
		this.socket.on('error',this.error)
	},

	disconnect: function(){
		server.socket.close();
		//remove all the chat chanels
		page.chat.leaveAll();
	},

	connectEvent: function(url){
		console.log('server connected')
		server.url = fn.parseURL(url);
		
		_(server.in).invoke('bind', server.socket)
		_(server.out).invoke('bind', server.socket)

		server.login(page.connect.login.email(),page.connect.login.password(),function(data){
			if(data){
				console.log('get json from server')
				loadShardData(function(){
					connect.exit()
					game.enter()
				})
			}
			else{
				//make the login inputs turn red and dissconnect
				page.connect.login.failed(true)
			}
 		})
	},

	disconnectEvent: function(){
		console.log('server disconnected')

		//unbind the ports
		_(server.in).invoke('unbind', server.socket)
		_(server.out).invoke('unbind', server.socket)

		game.exit()
		connect.enter()
	},

	login: function(email,password,callback){
		if(this.socket){
			this.socket.emit('login',{email:email,password:password},function(data){
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

	error: function(error){
		throw error.description.stack;
	}
}
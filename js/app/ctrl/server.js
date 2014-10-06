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
			f = _.partial(function(_this,callback,data){
				_this.data = data;
				callback = _.bind(callback,this);
				callback(data);
			},this,this.callback)
			socket.on(this.name,f)
		}
	}
})

ServerInDiff = ServerIn.extend({
	bind: function(socket){
		if(this.callback){
			f = _.partial(function(_this,callback,data){
				fn.combindOver(_this.data,data)
				callback = _.bind(callback,this);
				callback(_this.data);
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
	data: function(data){
		if(this.socket){
			this.socket.emit(this.name,data)
		}
	},
	bind: function(socket){
		this.socket = socket
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
	data: function(data){
		if(this.socket){
			diff = fn.diff(this._data,data)
			if(!_(diff).isEmpty()){
				this.socket.emit(this.name,diff)
				this._data = fn.duplicate(data);
			}
		}
	}
})

Server = Klass({
	//data from the server is stored here
	in: {
		player: new ServerOutDiff('player', function(data){
			game.players.updateData(data);
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
		player: new ServerInDiff('player',function(data){
			// update the player
			page.player(data);
		}),
		disconnect: new ServerIn('disconnect',function(){
			game.exit();
		})
	},
	out: {
		player: new ServerOutDiff('player'),
		chat: new ServerOut('chat')
	},
	socket: null,

	connect: function(url,connect,disconnect){
		if(!this.socket){
			this.socket = new io(url)

			//set up events
			this.socket.on('connect',connect)
			this.socket.on('disconnect',disconnect)
			this.socket.on('error',this.error)

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
	},

	error: function(error){
		throw error.description
	}
})
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
		}),
		chat: new ServerIn('chat',function(data){
			server.in.chat.data = data
		}),
	},
	out: {
		update: new ServerOutCache('update',100),
		message: new ServerOut('message',500)
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
			this.socket.emit('login',{email:email,password:password},callback)
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
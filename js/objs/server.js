// function Socket(url){
// 	_socket = new io(url,{reconnection:false})

// 	_socket.removeAllListeners()

// 	_socket.on('connect',function(){
// 		$("#connect").dialog('close')
// 		$("#login").dialog('open')
// 	})

// 	_socket.on('disconnect',function(){
// 		$("#connect").dialog('open')
// 		$("#login").dialog('close')
// 	})
		
// 	_socket.on('login',function(data){
// 		if(data.status == false){
// 			console.log('failed')
// 		}
// 		else{
// 			console.log('logged in')
// 			$("#login").dialog('close')

// 			//start the game
// 			game = new Game(engin,socket)
// 		}
// 	})

// 	return _socket
// }

ServerOut = Class.$extend({
	name: '',
	_data: {},
 	changed: false,
 	interval: null,
 	callback: null,
	__init__: function(name,timing,callback){
		if(timing){
			this.interval = window.setInterval(this.send,timing,this)
		}
		this.name = name || ''
	},
	data: function(data){
		if(data){
			if(JSON.stringify(data) !== JSON.stringify(this._data)){
				this.changed = true;

				if(data){
					this._data = data
				}
			}
		}
		return this._data;
	},
	send: function(_this){
		if(server.socket && _this.changed){
			if(this.callback){
				server.socket.emit(_this.name,_this._data,_this.callback)
			}
			else{
				server.socket.emit(_this.name,_this._data)
			}
			_this.changed = false
		}
	}
})

ServerIn = Class.$extend({
	name: '',
	data: {},
	callback: null,
	__init__: function(name,callback){
		this.name = name || ''
		this.callback = callback
	},
	connected: function(){
		if(this.callback){
			server.socket.on(this.name,this.callback)
		}
	}
})

Server = Class.$extend({
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
		player: new ServerOut('update',100),
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
				this.in[index].connected()
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
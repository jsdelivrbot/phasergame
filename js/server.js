server = {
	options: {
		reconnection: false,
		forceNew: true,
		timeout: 5000
	},
	socket: {},
	url: fn.parseURL(''),
	data: {}, //data object for the shared data
	init: function(cb){
		if(cb) cb();
	},
	connect: function(ip,cb){
		if(!this.connecting){
			ip = ip.replace('http://','')
			ip = ip.replace('https://','')
			ip = ip.replace('www.','')
			ip = 'http://'+ip;

			this.socket = new io(ip+':8181',server.options)

			//set up events
			this.socket.on('connect',this._connect.bind(this,cb))
			this.socket.on('disconnect',this._disconnect.bind(this))
			this.socket.on('connect_error',this._connectionError.bind(this,cb))
			this.socket.on('error',this.error)

			this.url = fn.parseURL(ip);
		}
	},
	disconnect: function(){
		if(this.connected){
			this.socket.close();
		}
	},
	emit: function(){
		if(this.connected){
			this.socket.emit.apply(this.socket,arguments);
		}
	},
	login: function(email,password,cb){
		if(this.connected){
			this.socket.emit('login',{
				email: email,
				password: password
			},cb);
		}
	},
	_connect: function(cb){
		this._setUpSocket(this.socket);
		if(cb) cb(true);
	},
	_disconnect: function(){

	},
	_connectionError: function(cb){
		if(cb) cb(false);
	},
	_setUpSocket: function(socket){ //sets up the events on the socket
		socket.on('userData',function(data){
			players.updateUserData(data);
		})
		socket.on('updatePlayers',function(data){
			players.updatePlayers(data);
		})
		socket.on('mapsChange',function(data){
			map.maps = data;
		})
	},

	error: function(error){
		throw error.description.stack;
	}
}
server.__defineGetter__('connected',function(){
	return server.socket.connected;
})
server.__defineGetter__('connecting',function(){
	return server.socket.connecting;
})
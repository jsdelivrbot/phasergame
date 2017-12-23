server = {
	options: {
		reconnection: false,
		forceNew: true,
		timeout: 5000,
	},
	socket: {},
	events: {
		connect: new Phaser.Signal(),
		disconnect: new Phaser.Signal(),
		login: new Phaser.Signal(),
	},
	loggedIn: false,
	url: fn.parseURL(""),
	data: {}, //data object for the shared data
	init: function(cb) {
		this.events.login.add(login);
		this.events.disconnect.add(logout);
		if (cb) cb();
	},
	connect: function(ip, cb) {
		if (!this.connecting) {
			ip = ip.replace("http://", "");
			ip = ip.replace("https://", "");
			ip = ip.replace("www.", "");
			ip = "http://" + ip;

			this.socket = new io(ip + ":8181", server.options);

			//set up events
			this.socket.on("connect", this._connect.bind(this, cb));
			this.socket.on("disconnect", this._disconnect.bind(this));
			this.socket.on("connect_error", this._connectionError.bind(this, cb));
			this.socket.on("error", this.error);

			this.url = fn.parseURL(ip);
		}
	},
	disconnect: function() {
		if (this.connected) {
			this.socket.close();
		}
	},
	emit: function() {
		if (this.connected) {
			this.socket.emit.apply(this.socket, arguments);
		}
	},
	login: function(email, password, cb) {
		this.emit(
			"login",
			{
				email: email,
				password: password,
			},
			function(loginMessage) {
				this.loggedIn = loginMessage.success;
				if (this.loggedIn) this.events.login.dispatch();
				if (cb) cb(loginMessage);
			}.bind(this)
		);
	},
	_connect: function(cb) {
		this.events.connect.dispatch();
		this._setUpSocket(this.socket);
		if (cb) cb(true);
	},
	_disconnect: function() {
		this.events.disconnect.dispatch();
		this.loggedIn = false;
	},
	_connectionError: function(cb) {
		if (cb) cb(false);
	},
	_setUpSocket: function(socket) {
		//sets up the events on the socket
		socket.on("userData", function(data) {
			players.updateUserData(data);
		});
		socket.on("updatePlayers", function(data) {
			players.updatePlayers(data);
		});
		socket.on("mapsChange", function(data) {
			map.maps = data;
		});
		socket.on("tilesChange", function(data) {
			if (data.map === map.loadedMapID) {
				map.setTiles(data);
			}
		});

		socket.on("tilePropertiesChange", function(data) {
			map.tilePropertiesChange(data);
		});

		socket.on("objectChange", objects.objectChange.bind(objects));
		socket.on("objectDelete", objects.objectDelete.bind(objects));
		socket.on("objectCreate", objects.objectCreate.bind(objects));

		socket.on("chatChanelMessage", page.chat.message.bind(page.chat));

		socket.on("chatChanelJoin", page.chat.join.bind(page.chat));
		socket.on("chatChanelPlayerJoin", page.chat.playerJoin.bind(page.chat));

		socket.on("chatChanelLeave", page.chat.leave.bind(page.chat));
		socket.on("chatChanelPlayerLeave", page.chat.playerLeave.bind(page.chat));
	},

	error: function(error) {
		throw error.description.stack;
	},
};
server.__defineGetter__("connected", function() {
	return server.socket.connected;
});
server.__defineGetter__("connecting", function() {
	return server.socket.connecting;
});

page = {
	connect: {
		newServer: {
			ip: ''
		},
		servers: [],
		login: {
			email: '',
			password: '',
			remember: false
		},
		selectedServer: -1,
		connect: function(){
			if(page.connect.servers()[page.connect.selectedServer()].status() === 1){
				server.connect(page.connect.servers()[page.connect.selectedServer()].ip(),function(){
					$("#connect-module").foundation('reveal', 'close')

					server.login(page.connect.login.email(),page.connect.login.password(),function(data){
						if(data){
							$("#login-module").foundation('reveal', 'close')
							game.enter()
						}
						else{
						}
			 		})
				},function(){
					$("#connect-module").foundation('reveal', 'open')
				})
			}
			
		},
		select: function(){
			//find the index
			for (var i = 0; i < page.connect.servers().length; i++) {
				if(page.connect.servers()[i].ip() == this.ip()){
					if(page.connect.selectedServer() !== i){
						page.connect.selectedServer(i)
					}
					else{
						page.connect.selectedServer(-1)
					}
					break;
				}
			};
		},
		add: function(){
			page.connect.newServer.ip(page.connect.newServer.ip().replace('http://',''))
			page.connect.newServer.ip(page.connect.newServer.ip().replace('https://',''))
			page.connect.newServer.ip(page.connect.newServer.ip().replace('www.',''))
			page.connect.newServer.ip(page.connect.newServer.ip().replace('/',''))

			page.connect.servers.push(ko.mapping.fromJS({
				status: 0, // 0: connecting, 1: connected, 2: failed
				title: '',
				description: '',
				ip: page.connect.newServer.ip(),
				players: 0,
			}))
			page.connect.newServer.ip('')

			page.connect.refresh();

			$('#connect-module').foundation('reveal', 'open')

			page.connect.refresh()
		},
		refresh: function(){
			//call all the servers
			for (var i = 0; i < page.connect.servers().length; i++) {
				page.connect.servers()[i].status(0)
				$.ajax({
					url: 'http://' + page.connect.servers()[i].ip() + ':8282',
					type: 'GET',
					dataType: 'json',
					data: {type: 'info'},
				})
				.done(_(function(data) {

					if(data.status){
						this.status(1)
						this.title(data.serverTitle)
						this.description(data.serverDescription)
						this.players(data.numberOfPlayers)
					}

				}).bind(page.connect.servers()[i]))
				.fail(_(function() {

					this.status(2)
					this.players(0)

				}).bind(page.connect.servers()[i]))
			};
		},
		removeServer: function(){
			page.connect.servers.splice(page.connect.selectedServer(),1)

			page.connect.selectedServer(-1);
		}
	},
	chat: {
		activeChanel: {
			chanel: null,
			id: -1,
			title: '',
			owner: 0,
			own: false,
			canLeave: true,
			newMessage: false,
			players: [],
			messages: []
		},
		chanels: [],
		sendMessageVal: '',
		chanelSelect: function(event){
			page.chat.open(this.id);
			$("#chat .off-canvas-wrap").removeClass('move-right')
			$("#chat .off-canvas-wrap").removeClass('move-left')
		},
		open: function(id){
			for (var i = 0; i < this.chanels().length; i++) {
				if(this.chanels()[i].id == id){
					ko.mapping.fromJS({chat:{activeChanel:page.chat.chanels()[i]}},page)

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
			ko.mapping.fromJS({chat:{activeChanel:this.activeChanel.chanel()}},page)

			// see if i own it
			page.chat.activeChanel.own(page.chat.activeChanel.owner() == game.players.player.data.data.id.id)
		},
		sendMessage: function(event){
			if(page.chat.sendMessageVal().length){
				server.out.chat.data({
					type: 'message',
					chanel: page.chat.activeChanel.id(),
					message: page.chat.sendMessageVal()
				})
				page.chat.sendMessageVal('')
			}
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
	player: new PlayerDataFull().data
}

//load from localStorage
page = ko.mapping.fromJS(ko.toJS(page))


if(localStorage.settings){
	json = JSON.parse(localStorage.settings);

	//dont overwrite these
	page.__ko_mapping__.ignore.push('connect.selectedServer')
	page.__ko_mapping__.ignore.push('connect.newServer')
	if(!json.connect.login.remember){
		page.__ko_mapping__.ignore.push('connect.login')
	}

	ko.mapping.fromJS(json,page)
}
$(window).unload(function(){
	//dont export these things
	page.__ko_mapping__.mappedProperties['chat'] = false;
	page.__ko_mapping__.mappedProperties['player'] = false;
	page.__ko_mapping__.mappedProperties['connect.login'] = false;
	page.__ko_mapping__.mappedProperties['connect.newServer'] = false;
	page.__ko_mapping__.mappedProperties['connect.selectedServer'] = false;

	localStorage.settings = ko.mapping.toJSON(page)
})

page.connect.refresh();
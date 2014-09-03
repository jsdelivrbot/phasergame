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
				if(data == false){
					console.log('failed')
				}
				else{
					console.log('logged in')
					$("#login-module").foundation('reveal', 'close')
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
		}	
	}
}
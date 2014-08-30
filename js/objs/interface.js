page = {
	modules: {
		connect: new Module({
			title: 'Server IP',
			contents: [
				new Input({
					default: '127.0.0.1:8181'
				})
			],
			buttons: [
				new Button({
					title: 'connect',
					class: 'right',
					click: function(){

						// socket = new Socket($("#server-ip").val())
						server.connect(page.modules.connect.settings.contents[0].value(),function(){
							page.modules.connect.close()
							page.modules.login.open()
						},function(){
							page.modules.connect.open()
						})
						
					}
				})
			]
		}),
		login: new Module({
			contents: [
				new Input({
					title: 'Email',
					default: 'account1@gmail.com'
				}),
				new Input({
					title: 'Password',
					default: 'password'
				})
			],
			buttons: [
				new Button({
					title: "Login",
					class: 'right',
					click: function(){
						server.login(page.modules.login.settings.contents[0].value(),page.modules.login.settings.contents[1].value(),function(data){
							if(data == false){
								console.log('failed')
							}
							else{
								console.log('logged in')
								page.modules.login.close()
							}
					 	})
					}
				})
			]
		})
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
					page.chat.activeChanel.own(page.chat.activeChanel.owner() == game.players.player.data.data.id.id)

					// $("#chat-messages").scrollTop($("#chat-messages").get(0).scrollHeight - $("#chat-messages").outerHeight())
					// $("#chat-in-messages").scrollTop($("#chat-in-messages").get(0).scrollHeight - $("#chat-in-messages").outerHeight())
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

			// $("#chat-messages").scrollTop($("#chat-messages").get(0).scrollHeight - $("#chat-messages").outerHeight())
			// $("#chat-in-messages").scrollTop($("#chat-in-messages").get(0).scrollHeight - $("#chat-in-messages").outerHeight())
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

_page = {
	modules: [],
	chat: page.chat
}
var j=0
for (var i in page.modules) {
	_page.modules[j++] = page.modules[i]
};
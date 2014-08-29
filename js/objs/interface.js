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

								//start the game
								game = new Game(engin,server)
							}
					 	})
					}
				})
			]
		})
	},
	chat: {
		messages: ko.observableArray([])
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
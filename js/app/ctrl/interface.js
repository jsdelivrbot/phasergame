function observable(val,change){
	o = ko.observable(val)
	o.subscribe(change)
	return o;
}

function keyBinding(title,key,events){
	k = {
		title: title,
		id: title.toLowerCase().replace(' ',''),
		keyCode: key,
		isDown: function(){return (this.group.enabled())? engin.input.keyboard._keys[this.keyCode()].isDown : false},
		isUp: function(){return (this.group.enabled())? engin.input.keyboard._keys[this.keyCode()].isUp : true},
	}

	if(events){
		if(events.up){
			k.up = events.up
		}

		if(events.down){
			k.down = events.down
		}

		if(events.rebind){
			k.rebind = events.rebind
		}
	}

	return k;
}

page = {
	version: 0.12,
	items: [],
	init: function(cb){
		//get the json
		db.db.find({
			type: 'settings'
		},function(err,data){
			if(err) throw err;

			//bind the save event
			$(window).on('beforeunload',function(){
				page.save();

				return '';
			})

			//load the data
			if(data.length){
				json = JSON.parse(data[0].settings);

				if(page.version == json.version){
					console.log('settings loaded')
					fn.combindOver(page,json)
				}
				else{
					console.log('localStorage out of date')
				}

				//create ko obj
				page = ko.mapping.fromJS(page)

				//create the keyBindings obj
				keyBindings = {
					enabled: _(page.menu.settings.keyBindings.enabled).bind(page.menu.settings.keyBindings),
					enable: _(page.menu.settings.keyBindings.enable).bind(page.menu.settings.keyBindings),
					bindKeys: _(page.menu.settings.keyBindings.bindKeys).bind(page.menu.settings.keyBindings)
				}
				_(page.menu.settings.keyBindings.bindings()).each(function(k){
					keyBindings[k.id()] = {}
					_(k.keys()).each(function(i){
						keyBindings[k.id()][i.id()] = i;
					})
				})
				keyBindings.enable('none');

				if(cb) cb();
			}

			//start saveLoop
			page.saveLoop(true);
		})
	},
	save: function(cb){
		json = ko.mapping.toJS(page)

		delete json.chat;
		delete json.player;
		delete json.loading;
		delete json.connect.newServer;
		delete json.connect.selectedServer;

		//servers
		delete json.connect.servers.selected;
		delete json.connect.servers.activeFilter;
		for(var i = 0; i < json.connect.servers.servers.length; i++){
			if(!json.connect.servers.servers[i].login.remember){
				json.connect.servers.servers[i].login.email = '';
				json.connect.servers.servers[i].login.password = '';
			}
		}

		//profile
		delete json.menu.profile;

		//inventory
		delete json.menu.inventory;

		//graphics
		delete json.menu.settings.graphics.cameraModes;
		delete json.menu.settings.graphics.cameraSmoothSpeeds;
		delete json.menu.settings.graphics.renderModes;

		//keys
		delete json.menu.settings.keyBindings.currentBinding;
		delete json.menu.settings.keyBindings.enabled;
		_(json.menu.settings.keyBindings.bindings).each(function(i){
			delete i.title;
			delete i.id;
			delete i.display;
			delete i.enabled;
			_(i.keys).each(function(i){
				delete i.title;
				delete i.id;
				delete i.group;
			})
		})

		db.db.update({
			type: 'settings'
		},{
			settings: JSON.stringify(json)
		},function(err){
			if(err) throw err;
			console.log('settings saved')
			if(cb) cb();
		})
	},
	saveLoop: function(dontSave){
		f = function(){
			setTimeout(page.saveLoop,30*1000)
		}
		if(dontSave){
			f();
		}
		else{
			page.save(f);
		}
	},
	loading: {
		logShowing: ko.observable(false),
		log: function(message, small){
			if(small){
				$el = $('<h6><b>[update]: </b><i></i></h6>');
			}
			else{
				$el = $('<h5><b>[update]: </b><i></i></h5>');
			}
			$el.children('i').text(message);
			$el.appendTo('#loading-log');
			$("#loading-log").scrollTop($("#loading-log")[0].scrollHeight);
		},
		setUpAppCache: function(){
			appCache = window.applicationCache;

			appCache.addEventListener('checking',function(event){
				$("#loading-text").text('Checking for updates')
				page.loading.log('Checking for updates');
				$("#loading-play").addClass('disabled')
			})

			appCache.addEventListener('obsolete',function(event){
				$("#loading-text").text('out of date')
			})

			appCache.addEventListener('noupdate',function(event){
				$("#loading-text").text('Up to Date')
				page.loading.log('Up to Date');
				$("#loading-play").removeClass('disabled')
			})

			appCache.addEventListener('downloading',function(event){
				$("#loading-text").text('Starting Download')
				page.loading.log('Starting Download');

				//get the list of files
				$.ajax({
	                type: "get",
	                url: "appcache.mf",
	                dataType: "text",
	                cache: false,
	                async: false,
	                success: function( content ){
	                    // Strip out the non-cache sections.
	                    // NOTE: The line break here is only to prevent
	                    // wrapping in the BLOG.
	                    content = content.replace(
	                        new RegExp(
	                            "(NETWORK|FALLBACK):" +
	                            "((?!(NETWORK|FALLBACK|CACHE):)[\\w\\W]*)",
	                            "gi"
	                        ),
	                        ""
	                    );

	                    // Strip out all comments.
	                    content = content.replace(
	                        new RegExp( "#[^\\r\\n]*(\\r\\n?|\\n)", "g" ),
	                        ""
	                    );

	                    // Strip out the cache manifest header and
	                    // trailing slashes.
	                    content = content.replace(
	                        new RegExp( "CACHE MANIFEST\\s*|\\s*$", "g" ),
	                        ""
	                    );

	                    // Strip out extra line breaks and replace with
	                    // a hash sign that we can break on.
	                    content = content.replace(
	                        new RegExp( "[\\r\\n]+", "g" ),
	                        "#"
	                    );
	                    appCacheFiles = content.split( "#" );
	                }
	            });
			})

			appCache.addEventListener('progress',function(event){
				$("#loading-bar>span").css('width',((appCacheCurrentFile / appCacheFiles.length) * 100)+'%')

				if(appCacheCurrentFile >= appCacheFiles.length -1){
					$("#loading-text").text('Preparing Update...')
				}
				else{
					$("#loading-text").text('Downloading...')
					page.loading.log('Updating: '+appCacheFiles[appCacheCurrentFile], true);
				}
				appCacheCurrentFile++;
			})

			appCache.addEventListener('error',function(event){
				if(event.reason !== "manifest"){
					$("#loading-text").text('Failed')
					$("#loading-bar").addClass('alert')
					page.loading.log('Failed to Update: '+event.reason);
				}
				else{
					$("#loading-text").text('Up to Date')
					page.loading.log('Cant Find Update');
				}
				$("#loading-play").removeClass('disabled')
			})

			appCache.addEventListener('updateready',function(event){
				$("#loading-text").text('Reloading!')
				$("#loading-play").removeClass('disabled')
				page.loading.log('Reloading Page');

				location.reload();
			})

			appCache.addEventListener('cached',function(event){
				$("#loading-text").text('Updated!')
				$("#loading-play").removeClass('disabled')
				page.loading.log('Update Successfull');
			})
		},
		play: function(){
			if(!$("#loading-play").hasClass('disabled')){
				$("#loading-play").text('Playing').addClass('disabled')
				//start the game
				cb = _.after(1,function(){
					$('#loading-modal').foundation('reveal', 'close')
					$('#loading-log').hide();
					engin = new Phaser.Game(800,600,page.menu.settings.graphics.renderMode(),'game', { 
						preload: preload, 
						create: function(){
							connect.enter()

							create()
						}, 
						update: update, 
						render: render
					},false,false)
				})

				loadData(cb)
			}
		}
	},
	connect: {
		servers: {
			filters: [
				{
					title: 'all',
					filter: [0,1,2]
				},
				{
					title: 'Online',
					filter: [1]
				},
				{
					title: 'Offline',
					filter: [2]
				}
			],
			activeFilter: 0,
			servers: [],
			serverStatuses: [
				{
					text: 'connecting',
					class: 'label'
				},
				{
					text: 'Online',
					class: 'label success'
				},
				{
					text: 'Offline',
					class: 'label alert'
				}
			],
			addServer: {
				ip: ''
			},
			selected: -1,
			add: function(){
				page.connect.servers.addServer.ip(page.connect.servers.addServer.ip().replace('http://',''));
				page.connect.servers.addServer.ip(page.connect.servers.addServer.ip().replace('https://',''));
				page.connect.servers.addServer.ip(page.connect.servers.addServer.ip().replace('www.',''));
				page.connect.servers.addServer.ip(page.connect.servers.addServer.ip().replace('/',''));

				page.connect.servers.servers.push(ko.mapping.fromJS({
					status: 0, // 0: connecting, 1: connected, 2: failed
					title: '',
					description: '',
					ip: page.connect.servers.addServer.ip(),
					players: 0,
					login: {
						email: '',
						password: '',
						remember: false
					}
				}))
				page.connect.servers.addServer.ip('')

				page.connect.servers.refresh();

				$('#connect-modal').foundation('reveal', 'open')
			},
			remove: function(){
				if(page.connect.servers.servers()[page.connect.servers.selected()]){
					page.connect.servers.servers.splice(page.connect.servers.selected(),1)

					page.connect.servers.selected(-1);
				}
			},
			connect: function(){
				server.connect(this.ip())
			},
			refresh: function(){
				//call all the servers
				for (var i = 0; i < page.connect.servers.servers().length; i++) {
					page.connect.servers.servers()[i].status(0)
					$.ajax({
						url: 'http://' + page.connect.servers.servers()[i].ip() + ':8282',
						type: 'GET',
						timeout: 8000,
						dataType: 'json',
						data: {type: 'info'},
					})
					.done(_(function(data) {

						if(data.title){
							this.status(1)
							this.title(data.title)
							this.description(data.description)
							this.players(data.players)
						}

					}).bind(page.connect.servers.servers()[i]))
					.fail(_(function() {

						this.status(2)
						this.players(0)

					}).bind(page.connect.servers.servers()[i]))
				};
			}
		},
		login: {
			loginCode: 0,
			login: function(){
				server.login(page.connect.servers.servers()[page.connect.servers.selected()].login.email(),page.connect.servers.servers()[page.connect.servers.selected()].login.password(),function(loginCode){
					$("#login-modal .alert-box>span").text(loginCodes[loginCode].message);
					$("#login-modal .alert-box").removeClass('info alert warning success secondary').addClass(loginCodes[loginCode].class);
					$("#login-modal .alert-box").finish().hide().show(250).delay(3000).hide(250)
					setTimeout(function(){
						if(loginCode == 0){
							loadShardData(function(){
								$("#login-modal").foundation('reveal','close');
								game.enter()
							})
						}
						else{
							page.connect.login.loginCode(loginCode)
						}
					},1250);
				})
			}
		}
	},
	menu:{
		profile: {
			playerData: new PlayerDataFull().data
		},
		settings: {
			graphics: {
				renderMode: Phaser.AUTO,
				renderModes: [
					{
						title: 'Auto',
						value: Phaser.AUTO,
						desc: 'If your browser dose not suport "Web GL" it will fall back on "Canvas"'
					},
					{
						title: 'Canvas',
						value: Phaser.CANVAS,
						desc: 'Uses standard "HTML5 Canvas" to render game'
					},
					{
						title: 'Web GL',
						value: Phaser.WEBGL,
						desc: 'Uses "Web GL" to render game'
					}
				],
				cameraModes: [
					'none',
					'dynamic',
					'smooth'
				],
				cameraMode: 'smooth',
				cameraSmoothSpeed: 40,
				cameraSmoothSpeeds: [
					{
						title: 'slow',
						value: 50
					},
					{
						title: 'normal',
						value: 40
					},
					{
						title: 'fast',
						value: 30
					}
				],
			},
			keyBindings:{
				currentBinding: null,
				enabled: '',
				enable: function(groupID){
					_(this.bindings()).each(function(group){
						group.enabled(false);
						if(group.id() == groupID){
							group.enabled(true);
							this.enabled(groupID);
						}
					}.bind(this))
				},
				bind: function(event){
					if(typeof page.menu.settings.keyBindings.currentBinding === 'object'){
						_keybinding = page.menu.settings.keyBindings.currentBinding

						// see if its a mouse event or keyboard
						switch(event.type){
							case 'keydown':
								keyCode = event.keyCode
								break;
							case 'mousedown':
								keyCode = event.which-1
								break;
						}

						//tell the key its being rebound
						if(_keybinding.rebind){
							// if its dose not like the key then return
							if(!_keybinding.rebind(keyCode)){
								$("#keybinding").hide()
								engin.input.disabled = false
								return;
							}
						}

						// if there are up/down events on the key the unbind them
						if(_keybinding.up){
							a = engin.input.keyboard._keys[_keybinding.keyCode()]
							if(a){
								a.onUp.remove(_keybinding.up)
							}
						}
						if(_keybinding.up){
							a = engin.input.keyboard._keys[_keybinding.keyCode()]
							if(a){
								a.onDown.remove(_keybinding.down)
							}
						}

						// see if its a mouse event or keyboard
						switch(event.type){
							case 'keydown':
								_keybinding.keyCode(keyCode)
								break;
							case 'mousedown':
								_keybinding.keyCode(keyCode)
								break;
						}

						// bind
						engin.input.keyboard.addKey(_keybinding.keyCode());

						//remove the capture
						engin.input.keyboard.removeKeyCapture(_keybinding.keyCode());

						// find events
						if(_keybinding.up){
							engin.input.keyboard._keys[_keybinding.keyCode()].onUp.add(_keybinding.up)
						}
						if(_keybinding.down){
							engin.input.keyboard._keys[_keybinding.keyCode()].onDown.add(_keybinding.down)
						}

						$("#keybinding").hide()
						engin.input.disabled = false
					}
				},
				changeBinding: function(){
					page.menu.settings.keyBindings.currentBinding = this;

					$("#keybinding").show()
					engin.input.disabled = true
				},
				bindKeys: _(function(){
					for (var k = 0; k < this.bindings().length; k++) {
						keys = this.bindings()[k].keys()

						for (var i = 0; i < keys.length; i++) {
							// create the key
							engin.input.keyboard.addKey(keys[i].keyCode())

							//remove the capture
							engin.input.keyboard.removeKeyCapture(keys[i].keyCode())

							keys[i].group = this.bindings()[k];

							// events
							if(keys[i].down){
								engin.input.keyboard._keys[keys[i].keyCode()].onDown.add(_(function(event){
									if(this.enabled()){
										event();
									}
								}).bind(keys[i].group,keys[i].down))
							}
							if(keys[i].up){
								engin.input.keyboard._keys[keys[i].keyCode()].onUp.add(_(function(event){
									if(this.enabled()){
										event();
									}
								}).bind(keys[i].group,keys[i].up))
							}
						};
						
					};
				}).once(),
				bindings: [
					{
						title: 'None',
						display: false,
						id: 'none',
						enabled: false,
						keys: []
					},
					{
						title: 'Menu',
						display: true,
						id: 'menu',
						enabled: false,
						keys: [
							keyBinding('Close',Phaser.Keyboard.ESC,{
								down: function(){
									//see if there are menus open
									if($(".menu.open").length){
										$(".menu.open:not(.cant-close)").foundation('reveal','close')
										keyBindings.enable('game')
									}
								},
								rebind: function(key){
									return (key > 2)
								}
							})
						]
					},
					{
						title: 'Inventory',
						display: true,
						id: 'inventory',
						enabled: false,
						keys: [
							keyBinding('Close',Phaser.Keyboard.I,{
								down: function(){
									//see if there are menus open
									$("#inventory").foundation('reveal','close')
									keyBindings.enable('game')
								},
								rebind: function(key){
									return (key > 2)
								}
							})
						]
					},
					{
						title: 'Game',
						display: true,
						id: 'game',
						enabled: false,
						keys: [
							keyBinding('Up',Phaser.Keyboard.W),
							keyBinding('Down',Phaser.Keyboard.S),
							keyBinding('Right',Phaser.Keyboard.D),
							keyBinding('Left',Phaser.Keyboard.A),
							keyBinding('Interact',Phaser.Keyboard.E,{
								up: maps.resources.key.up.bind(maps.resources),
								down: maps.resources.key.down.bind(maps.resources)
							}),
							keyBinding('Open Chat',Phaser.Keyboard.ENTER,{
								up: function(){
									//open chat if there are no menus showing
									if($(".menu.open").length == 0){
										$("#chat").addClass('out')
										$('#chat > div.off-canvas-wrap > div > div > form > input[type="text"]').trigger('focus')
									}
								},
								rebind: function(key){
									return (key > 2)
								}
							}),
							keyBinding('Close Chat',Phaser.Keyboard.ESC,{
								up: function(){
									if($("#chat").hasClass('out')){
										$("#chat").removeClass('out')
										$('#chat > div.off-canvas-wrap > div > div > form > input[type="text"]').trigger('blur')
									}
								},
								rebind: function(key){
									return (key > 2)
								}
							}),
							keyBinding('Open Inventory',Phaser.Keyboard.I,{
								down: function(){
									$("#chat").removeClass('out')
									$('#chat > div.off-canvas-wrap > div > div > form > input[type="text"]').trigger('blur')
									$inventory = $("#inventory")
									if(!$inventory.hasClass('open')){
										$inventory.foundation('reveal','open')
										keyBindings.enable('inventory')
									}
								},
								rebind: function(key){
									return (key > 2)
								}
							}),
							keyBinding('Open Menu',Phaser.Keyboard.ESC,{
								down: function(){
									if($("#chat").hasClass('out')){
										return;
									}
									$menu = $("#menu")
									if(!$menu.hasClass('open')){
										$menu.foundation('reveal','open')
										keyBindings.enable('menu')
									}
								},
								rebind: function(key){
									return (key > 2)
								}
							})
						]
					}
				]
			},
			sound: {
				volume: observable(0.75, function(val){
					if(engin.isBooted){
						engin.sound.volume = parseFloat(val);
					}
				}),
				mute: observable(false, function(val){
					if(engin.isBooted){
						engin.sound.mute = val;
					}
				})
			}
		},
		menu: {
			disconnect: function(){
				server.disconnect()
				page.connect.login.loginCode(0);
			},
			exit: function(){
				window.close()
			}
		},
		inventory: {
			data: []
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
						page.chat.activeChanel.own(page.chat.activeChanel.owner() == server.in.player.data.id.id)
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
			page.chat.activeChanel.own(page.chat.activeChanel.owner() == server.in.player.data.id.id)
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
		leaveAll: function(){
			_(page.chat.chanels()).each(function(chanel){
				server.out.chat.data({
					type: 'leave',
					chanel: chanel.id
				})
			})
			page.chat.chanels([])
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
	//functions for the knockout in the html
	toggle: function(observable){
		return function(){
			this(!this());
		}.bind(observable);
	},
	increase: function(ob,amount){
		return _.partial(function(ob,amount){
			amount = amount || 1;
			ob(ob()+amount);
		},ob,amount);
	},
	decrease: function(ob,amount){
		return _.partial(function(ob,amount){
			amount = amount || 1;
			ob(ob()-amount);
		},ob,amount);
	},
	combind: _.compose,
	set: function(ob,amount){
		return _.partial(function(ob,amount){
			if(typeof amount == "function"){
				ob(amount());
			}
			else{
				ob(amount);
			}
		},ob,amount);
	}
}

//load
if(localStorage.settings){
	json = JSON.parse(localStorage.settings);

	// see if its the same version
}
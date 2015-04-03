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
	versions: {
		currentVersion: 'v0.1.4',
		phaserVersion: '',
		pixiVersion: '',
		baseURL: 'https://cdn.rawgit.com/rdfriedl/phasergame/RELEASETAG/index.html',
		versions: [],
		selectedVersion: 0,
		enableDevVersions: false,
		init: function(cb){
			page.versions.phaserVersion(Phaser.VERSION);
			page.versions.pixiVersion(PIXI.VERSION);
			var func = function(data){
				for (var i = 0; i < data.length; i++) {
					data[i].url = page.versions.baseURL().replace('RELEASETAG',data[i].tag);
				};
				page.versions.versions(data);

				if(cb) cb();
			}
			$.ajax({
				url: 'https://api.github.com/repos/rdfriedl/phasergame/releases',
				type: 'GET',
				dataType: 'json'
			})
			.done(function(data) {
				page.versions.versions(data);

				for (var i = 0; i < data.length; i++) {
					if(data[i].tag_name == page.versions.currentVersion()){
						page.versions.selectedVersion(i);
					}
				};
				//see if we found the version
				if(page.versions.selectedVersion() == undefined){ //for some reason selectedVersion is undefined when it did not find the version
					page.versions.versions.splice(0,0,{
						url: "",
						assets_url: "",
						upload_url: "",
						html_url: "",
						id: 0,
						tag_name: page.versions.currentVersion(),
						target_commitish: "",
						name: "unknown Version",
						draft: false,
						author: {
							login: "unknown",
							id: 0,
							avatar_url: "",
							gravatar_id: "",
							url: "",
							html_url: "",
							followers_url: "",
							following_url: "",
							gists_url: "",
							starred_url: "",
							subscriptions_url: "",
							organizations_url: "",
							repos_url: "",
							events_url: "",
							received_events_url: "",
							type: "User",
							site_admin: false
						},
						prerelease: false,
						created_at: Date(),
						published_at: Date(),
						assets: [],
						tarball_url: "",
						zipball_url: "",
						body: ""
					})
					page.versions.selectedVersion(0)
				}
			})
			.fail(function(){
				console.error('failed to load versions')
			})
		},
		launch: function(){
			//load the selected version
			var version = page.versions.versions()[page.versions.selectedVersion()];
			if(version){
				window.open(page.versions.baseURL().replace('RELEASETAG',version.tag_name),'_self');
			}
		}
	},
	items: [],
	init: function(cb){
		//create ko obj
		page = ko.mapping.fromJS(page)

		//add system chat chanel
		page.chat.chanels.push(ko.mapping.fromJS({
			id: -1,
			players: [],
			settings: {
				title: 'System',
				canLeave: false,
				default: true,
				owner: -1,
				canSendMessage: false
			},
			messages: [],
		}))

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

		//add the settings
		page.settings.add('servers',page.connect.servers,[
			{
				prop: 'servers',
				save: function(servers){
					for (var i = 0; i < servers.length; i++) {
						if(!servers[i].login.remember){
							servers[i].login.email = '';
							servers[i].login.password = '';
						}
					};
					return servers;
				},
				load: function(servers){
					for (var i = 0; i < servers.length; i++) {
						servers[i] = ko.mapping.fromJS(servers[i]);
						servers[i].login.email.subscribe(page.settings.change.bind(this,this))
						servers[i].login.password.subscribe(page.settings.change.bind(this,this))
						servers[i].login.remember.subscribe(page.settings.change.bind(this,this))
					};
					return servers;
				}
			}
		],1)
		page.settings.add('keyBindings',page.menu.settings.keyBindings,[
			{
				prop: 'bindings',
				save: function(bindings){
					for (var i = 0; i < bindings.length; i++) {
						for (var k = 0; k < bindings[i].keys.length; k++) {
							bindings[i].keys[k] = bindings[i].keys[k].keyCode
						};
					};
					return bindings;
				},
				load: function(bindings){
					for (var i = 0; i < bindings.length; i++) {
						for (var k = 0; k < bindings[i].keys.length; k++) {
							page.menu.settings.keyBindings.bindings()[i].keys()[k].keyCode(bindings[i].keys[k]);
							//subscribe to the change event on the keys
							page.menu.settings.keyBindings.bindings()[i].keys()[k].keyCode.subscribe(page.settings.change.bind(this,this));
						};
					};
					return page.menu.settings.keyBindings.bindings();
				}
			}
		],1.1)
		page.settings.add('sound',page.menu.settings.sound,['volume','mute'],1)
		page.settings.add('graphics',page.menu.settings.graphics,['renderMode','cameraMode','cameraSmoothSpeed'],1.1)

		this.versions.init();
		
		if(cb) cb();
	},
	loading: {
		logShowing: ko.observable(false),
		log: function(title,message, small){
			if(small){
				$el = $('<h6><b>['+title+']: </b><i></i></h6>');
			}
			else{
				$el = $('<h5><b>['+title+']: </b><i></i></h5>');
			}
			$el.children('i').text(message);
			$el.appendTo('#loading-log');
			$("#loading-log").scrollTop($("#loading-log")[0].scrollHeight);
		},
		setUpAppCache: function(){
			appCache = window.applicationCache;

			appCache.addEventListener('checking',function(event){
				$("#loading-text").text('Checking for updates')
				page.loading.log('Update','Checking for updates');
				$("#loading-play").addClass('disabled')
			})

			appCache.addEventListener('obsolete',function(event){
				$("#loading-text").text('out of date')
			})

			appCache.addEventListener('noupdate',function(event){
				$("#loading-text").text('Up to Date')
				page.loading.log('Update','Up to Date');
				$("#loading-play").removeClass('disabled')
			})

			appCache.addEventListener('downloading',function(event){
				$("#loading-text").text('Starting Download')
				page.loading.log('Update','Starting Download');

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
					page.loading.log('Update','Updating: '+appCacheFiles[appCacheCurrentFile], true);
				}
				appCacheCurrentFile++;
			})

			appCache.addEventListener('error',function(event){
				if(event.reason !== "manifest"){
					$("#loading-text").text('Failed')
					$("#loading-bar").addClass('alert')
					page.loading.log('Update','Failed to Update: '+event.reason);
				}
				else{
					$("#loading-text").text('Up to Date')
					page.loading.log('Update','Cant Find Update');
				}
				$("#loading-play").removeClass('disabled')
			})

			appCache.addEventListener('updateready',function(event){
				$("#loading-text").text('Reloading!')
				$("#loading-play").removeClass('disabled')
				page.loading.log('Update','Reloading Page');

				location.reload();
			})

			appCache.addEventListener('cached',function(event){
				$("#loading-text").text('Updated!')
				$("#loading-play").removeClass('disabled')
				page.loading.log('Update','Update Successfull');
			})
		},
		play: function(){
			if(!$("#loading-play").hasClass('disabled')){
				$("#loading-play").text('Playing').addClass('disabled')
				//start the game
				cb = _.after(1,function(){
					$('#loading-modal').foundation('reveal', 'close')
					$('#loading-log').hide();

					startEngin(function(){
						$("#connect-modal").foundation('reveal', 'open');
						page.connect.servers.refresh();
					});
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
				$('#connect-loading-modal span').text('Connecting...')
				$('#connect-loading-modal').foundation('reveal','open');
				
				server.connect(this.ip(),function(connected){
					if(connected){
						$('#connect-loading-modal span').text('connected');
						setTimeout(function(){
							$('#login-modal').foundation('reveal','open')
						},500)
					}
					else{
						$('#connect-loading-modal span').text('Failed')
						setTimeout(function(){
							$('#connect-modal').foundation('reveal','open')
						},1000)
					}
				})
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
			loggedIn: false,
			loggingIn: false,
			login: function(){
				page.connect.login.loggingIn(true);
				server.login(page.connect.servers.servers()[page.connect.servers.selected()].login.email(),page.connect.servers.servers()[page.connect.servers.selected()].login.password(),function(loginMessage){
					$("#login-modal .alert-box>span").text(loginMessage.message);
					$("#login-modal .alert-box").removeClass('info alert warning success secondary').addClass(loginMessage.class);
					$("#login-modal .alert-box").finish().hide().show(250).delay(3000).hide(250)

					if(loginMessage.success){
						setTimeout(function(){
							$("#login-modal").foundation('reveal','close');
							page.connect.login.loggingIn(false);
						},1250);
					}
				})
			}
		}
	},
	menu:{
		profile: {
			// playerData: new PlayerDataFull().data
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
				debug: observable(false,function(val){
					if(objects.group){
						objects.group.visible = val;
					}

					//loop through the layers and hide/show debug layers
					for (var i = 0; i < map.layers.length; i++) {
						map.layers[i].group.visible = (val)? true : map.layers[i].visibleInGame;
					};

					if(val){
						$('.pdebug').show();
					}
					else{
						$('.pdebug').hide();

						//reset the debug
						engin.debug.reset()
					}
				})
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
						if(_keybinding.down){
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
				changeBinding: function(){ //html event
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
						title: 'Chat',
						display: false,
						id: 'chat',
						enabled: false,
						keys: [
							keyBinding('Close',Phaser.Keyboard.ESC,{
								up: function(){
									//see if there are menus open
									page.chat.open(false);
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
								// up: maps.resources.key.up.bind(maps.resources),
								// down: maps.resources.key.down.bind(maps.resources)
							}),
							keyBinding('Open Chat',Phaser.Keyboard.ENTER,{
								up: function(){
									//open chat if there are no menus showing
									page.chat.open(true);
									$('#chat .message').trigger('focus')
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
		open: observable(false,function(val){
			if(val){
				page.chat.showingUsers(false);
				keyBindings.enable('chat');
			}
			else{
				page.chat.showingUsers(false);
				keyBindings.enable('game');
			}
		}),
		showingUsers: false,
		chanels: [],
		activeChanel: 0,
		getChanel: function(id){
			for (var i = 0; i < this.chanels().length; i++) {
				if(this.chanels()[i].id() == id){
					return this.chanels()[i];
				}
			};
		},
		sendMessage: function(){ //"this" is the change
			var chanel = this.chanels()[this.activeChanel()];
			if(chanel){
				if(chanel.message() == '') return;

				server.emit('chatChanelMessage',{
					chanel: chanel.id(),
					message: {
						from: players.player.name,
						to: '',
						message: chanel.message()
					}
				})
				chanel.message('');
			}
		},
		leaveChanel: function(id){
			server.emit('chatChanelLeave',id)
		},
		leaveAllChanels: function(){
			server.emit('chatChanelLeaveAll')
		},
		removeAllChanels: function(){
			var a = page.chat.chanels();
			a.length = 1;
			page.chat.chanels(a);
		},

		scroll: function(){
			if($('#chat .messages>*:last').get(0)){
				$('#chat .messages>*:last').get(0).scrollIntoView();
			}
		},
		formatToFrom: function(message){
			return (message.from.length)? '[ '+message.from+((message.to)? ' -> '+message.to : '')+' ]:' : '';
		},

		// server events
		join: function(data){
			// add the chanel
			this.chanels.push(ko.mapping.fromJS({
				id: data.chanel.id,
				settings: data.chanel.settings,
				players: data.players,
				messages: [],
				message: ''
			}));
		},
		playerJoin: function(data){
			// add the player
			var chanel = this.getChanel(data.chanel.id);
			if(chanel){
				chanel.players.push(ko.mapping.fromJS(data.player));
			}
		},
		message: function(data){
			//fix message colors
			var str = data.message.message;
			str = str.replace('[32m','<span class="green">');
			str = str.replace('[36m','<span class="cyan">');
			str = str.replace('[33m','<span class="yellow">');
			str = str.replace('[31m','<span class="red">');
			str = str.replace('[39m','</span>');
			str = str.replace('[49m','</span>');

			data.message.message = str;

			// add the message
			var chanel = this.getChanel(data.chanel.id);
			if(chanel){
				chanel.messages.push(data.message);

				if(chanel.messages().length > 100){
					chanel.messages.splice(0,1);
				}

				if(this.activeChanel() == this.chanels.indexOf(chanel)){
					//scroll into view
					this.scroll();
				}
			}
		},
		leave: function(data){
			// remove the player
			for (var i = 0; i < this.chanels().length; i++) {
				if(this.chanels()[i].id() == data.id){
					this.chanels.splice(i,1);
					break;
				}
			};
		},
		playerLeave: function(data){
			// find the chanel
			var chanel = this.getChanel(data.chanel.id);
			if(chanel){
				for (var i = 0; i < chanel.players().length; i++) {
					if(chanel.players()[i].id() == data.player.id){
						chanel.players.splice(i,1);
						break;
					}
				};
			}
		}
	},
	log: function(message){
		page.chat.message({
			chanel: {
				id: -1,
			},
			message: {
				from: '',
				to: '',
				message: message
			}
		})
	},
	//handles saving and loading settings
	settings: {
		settings: [],
		init: function(cb){ //bind event and load all
			$(window).on('beforeunload',this.unload.bind(this));

			this.loadAll(function(){
				this.saveLoop(0);

				if(cb) cb();
			}.bind(this))
		},
		add: function(id,obj,properties,version){
			//parse the properties array
			for (var i = 0; i < properties.length; i++) {
				if(typeof properties[i] == 'string'){
					properties[i] = {
						prop: properties[i],
						save: undefined,
						load: undefined
					};
				}
			};
			var setting = {
				id: id,
				obj: obj,
				version: version,
				properties: properties,
				saved: true
			};
			this.settings.push(setting);

			//loop through the properties and bind events to observables
			for (var i = 0; i < setting.properties.length; i++) {
				if(obj[setting.properties[i].prop]){
					if(obj[setting.properties[i].prop].subscribe){
						obj[setting.properties[i].prop].subscribe(this.change.bind(this,setting));
					}
				}
			};
		},
		load: function(id,cb){
			console.log(id+' settings loaded')
			db.load(id,function(data){
				if(data){
					for (var i = 0; i < this.settings().length; i++) {
						if(this.settings()[i].id === id){
							//see if its the same version
							if(this.settings()[i].version == data.data._version){

								var setting = this.settings()[i];

								//loop through the properties and set them
								for (var k = 0; k < setting.properties.length; k++) {
									if(setting.obj[setting.properties[k].prop] !== undefined){

										//see if it has a load function
										var val = data.data[setting.properties[k].prop];
										if(setting.properties[k].load){
											val = setting.properties[k].load.bind(setting)(val);
										}

										//set it
										if(typeof setting.obj[setting.properties[k].prop] == 'function'){
											setting.obj[setting.properties[k].prop](val);
										}
										else{
											setting.obj[setting.properties[k].prop] = val;
										}
									}
								};

								setting.saved = true;
								break;
							}
							else{
								page.loading.log('Settings',id+' settings out of date')
							}
						}
					}
				}
				if(cb) cb();
				return;
			}.bind(this))
		},
		save: function(id,cb){
			console.log(id+' settings saved')
			page.log(id+' settings saved');
			//find the setting
			for (var i = 0; i < this.settings().length; i++) {
				if(this.settings()[i].id === id){

					var setting = this.settings()[i];
					var json = {};
					json._version = this.settings()[i].version;

					//set the properties
					for (var k = 0; k < setting.properties.length; k++) {
						if(setting.obj[setting.properties[k].prop] !== undefined){

							if(typeof setting.obj[setting.properties[k].prop] == 'function'){
								val = ko.mapping.toJS(setting.obj[setting.properties[k].prop]);
							}
							else{
								val = setting.obj[setting.properties[k].prop];
							}

							//see if theres a save function
							if(setting.properties[k].save){
								val = setting.properties[k].save.bind(setting)(val);
							}

							json[setting.properties[k].prop] = val;
						}
					};
					db.save(this.settings()[i].id,json,cb);
					setting.saved = true;
					return;
				}
			};
		},
		change: function(setting){
			setting.saved = false;
		},
		loadAll: function(cb){
			cb = (cb)? _.after(this.settings().length-1,cb) : function(){};
			for (var i = 0; i < this.settings().length; i++) {
				this.load(this.settings()[i].id,cb);
			};
		},
		saveAll: function(cb){
			cb = _.after(this.settings().length-1,cb);
			for (var i = 0; i < this.settings().length; i++) {
				this.save(this.settings()[i].id,cb);
			};
		},
		saveLoop: function(i){
			if(this.settings()[i]){
				if(!this.settings()[i].saved){
					this.save(this.settings()[i].id,function(){
						setTimeout(this.saveLoop.bind(this,++i),1000)
					}.bind(this))
				}
				else{
					setTimeout(this.saveLoop.bind(this,++i),1000)
				}
			}
			else{
				setTimeout(this.saveLoop.bind(this,0),1000)
			}
		},
		unload: function(){
			var saved = true;
			//loop through the settings and see if they are all saved
			for (var i = 0; i < this.settings().length; i++) {
				if(!this.settings()[i].saved){
					saved = false;
					this.save(this.settings()[i].id);

					//log it
					page.log('Settings',this.settings()[i].id+' have not saved yet!');
					console.log('Settings: '+this.settings()[i].id+' have not saved yet!');
				}
			};
			if(!saved){
				return 'there are settings that are not saved yet';
			}
		}
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
}
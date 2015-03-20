function array(val,length){
	a = new Array();
	for (var i = 0; i < length; i++) {
		a[i]=val;
	};
	return a;
}

map = {
	Chunk: function(x,y,map){
		this.x = x;
		this.y = y;
		this.width = 16;
		this.height = 16;
		this._layers = []
		this.map = map;
		this.loaded = false;
		this.loading = false;

		this.events = {
			loaded: new Phaser.Signal(),
			inportedData: new Phaser.Signal()
		};

		//acts as the layers array
		this.__defineGetter__('layers',function(){ //syncs layers with map
			if(!this.loaded) return [];
			if(!map.layersLoaded) return [];
			var a = [];
			for (var i = 0; i < map.layers.length; i++) {
				s = false;
				for (var k = 0; k < this._layers.length; k++) {
					if(this._layers[k].id === map.layers[i].id){
						this._layers[k].index = i;
						//move it to the new array
						a.push(this._layers[k]);
						this._layers.splice(k,1);
						s = true;
						break;
					}
				};
				if(!s){
					var l = new map.Layer(map.layers[i].id,this,map.layers[i]);
					l.index = i;
					a.push(l);
				}
			};
			//loop through the old list and remove one that are there (layers that are used are moved to the array "a")
			for (var i = 0; i < this._layers.length; i++) {
				this._layers[i].remove();
			};
			this._layers = a;
			return a;
		})
		this.getLayer = function(i){
			if(this.layerLoaded(i)){
				return this.layers[i];
			}
			else{
				return new MapLayer(-1,this);
			}
		};
		this.layerLoaded = function(i){
			return this.layers[i] !== undefined;
		}
		this.remove = function(){ //removes chunk images from the svg
			var a = this.layers;
			for (var i = 0; i < a.length; i++) {
				a[i].remove();
			};
		}
		this.inportData = function(data){ //inports data from server format
			this.loaded = true;
			a = this.layers;
			cb = _.after(a.length,function(){
				this.events.inportedData.dispatch(this);
			}.bind(this));

			for (var i = 0; i < data.data.length; i++) {
				if(a[i]){
					a[i].inportData(data.data[i],cb);
				}
			};
		}

		this.__defineGetter__('tileX',function(){
			return this.x * this.width;
		})

		this.__defineGetter__('tileY',function(){
			return this.y * this.height;
		})
	},
	Layer: function(id,chunk,layer){
		this.id = id;
		this.chunk = chunk;
		this.layer = layer; //map.layers
		this.tiles = new array(map.defaultTile,this.chunk.width*this.chunk.height);
		this.bitmap = engin.add.bitmapData(this.chunk.width*32,this.chunk.height*32);
		this.sprite = this.bitmap.addToWorld(this.chunk.x*16*32,this.chunk.y*16*32);
		this.sprite.name = this.chunk.x+'|'+this.chunk.y;
		this.layer.group.add(this.sprite);

		this.getTile = function(x,y){
			return this.tiles[y*this.chunk.width+x];
		}
		this.setTile = function(x,y,t,dontDraw){
			this.tiles[y*this.chunk.width+x] = t;
			//draw tile
			if(!dontDraw){
				for (var i = map.tilemap.tilesets.length - 1; i >= 0; i--) {
					if(map.tilemap.tilesets[i].containsTileIndex(t)){
						//test to see if its a blank tile ------going to have to change this-----------
						if(t == map.defaultTile){
							this.bitmap.ctx.clearRect(x*32,y*32,map.tilemap.tileWidth,map.tilemap.tileHeight);
						}
						else{
							map.tilemap.tilesets[i].draw(this.bitmap.ctx,x*32,y*32,t);
						}
					}
				};

				this.bitmap.dirty = true;
			}
			
			//set collision
			if(this.layer.collision){
				if(map.tilemap.collideIndexes.indexOf(t) == -1 && t !== map.defaultTile){
					map.tilemap.setCollision(t,true,map.collisionLayer,true);
				}

				//set tile
				if(t !== map.defaultTile){
					map.tilemap.putTile(t,this.chunk.x*16+x,this.chunk.y*16+y,map.collisionLayer);
				}
				else{
					map.tilemap.removeTile(this.chunk.x*16+x,this.chunk.y*16+y,map.collisionLayer);
				}
			}
		}
		this.remove = function(){
			for (var x = 0; x < this.chunk.width; x++) {
				for (var y = 0; y < this.chunk.height.length; y++) {
					this.setTile(x,y,map.defaultTile,true);
				};
			};			
			this.sprite.destroy();
		}

		this.inportData = function(data,cb){ //inports a array of tiles (256 length)
			var done = function(){
				this.bitmap.dirty = true; //render it
				engin.add.tween(this.sprite).to( { alpha: 1 }, 500, "Linear", true);
				if(cb) cb();
			}
			var func = function(data,i){
				y = Math.floor(i/this.chunk.width);
				x = i-(y*this.chunk.width);
				this.setTile(x,y,data[i])
				this.bitmap.dirty = false; //dont render it yet

				if(++i < data.length){
					setTimeout(func.bind(this,data,i),1);
				}
				else{
					done.call(this);
				}
			}
			this.sprite.alpha = 0;
			setTimeout(func.bind(this,data,0),1);
			// for (var i = 0; i < data.length; i++) {
			// 	y = Math.floor(i/this.chunk.width);
			// 	x = i-(y*this.chunk.width);
			// 	this.setTile(x,y,data[i])
			// };
		}
	},

	loadedMapID: -1,
	loadingMap: false,
	defaultTile: 0,
	viewRange: 800,
	layersLoaded: false,
	tilemap: undefined,
	abovePlayerGroup: undefined,
	belowPlayerGroup: undefined,
	collisionLayer: undefined,
	tilesets: [],
	chunks: [],
	layers: [],
	maps: [],

	events: {
		loadMap: new Phaser.Signal(), //dispached before a new map is loaded
		chunkLoaded: new Phaser.Signal(),
		layersLoaded: new Phaser.Signal()
	},
	loadChunkTimer: undefined,

	init: function(){
		this.tilemap = engin.add.tilemap(null,32,32);
		this.abovePlayerGroup = engin.add.group(abovePlayerGroup,'mapLayers');
		this.belowPlayerGroup = engin.add.group(belowPlayerGroup,'mapLayers');
		abovePlayerGroup.moveDown(this.abovePlayerGroup);

		//load tilesets
		for (var i = 0; i < this.tilesets.length; i++) {
			var gid = 0;
			if(i !== 0){
				gid = this.tilemap.tilesets[i-1].firstgid + this.tilemap.tilesets[i-1].total;
			}
			this.tilemap.addTilesetImage(this.tilesets[i].name,this.tilesets[i].name,32,32,0,0,gid);
		};

		//load loop
		this.loadChunkTimer = engin.time.create(false);
		var func = function(){
			this.loadChunksInView.call(this);

			this.loadChunkTimer.add(1000,func,this);
		};
		this.loadChunkTimer.add(1000,func,this);
		this.loadChunkTimer.start();
		this.loadChunkTimer.pause();
	},
	getMap: function(mapID){
		for (var i = this.maps.length - 1; i >= 0; i--) {
			if(this.maps[i].id == mapID){
				return this.maps[i];
			}
		};
	},
	loadLayers: function(cb){
		//load layers
		server.emit('getLayers',function(data){
			this.layersLoaded = true;
			var a = new SortedArray(data,function(a,b){
				if(a.abovePlayer === b.abovePlayer){
					if(a.level === b.level){
						return 0;
					}
					else if(a.level < b.level){
						return 1;
					}
					else{
						return -1;
					}
				}
				else if(a.abovePlayer < b.abovePlayer){
					return 1;
				}
				else{
					return -1;
				}
			})
			//add layers
			for (var i = 0; i < a.length; i++) {
				a[i].group = engin.add.group((a[i].abovePlayer)? this.abovePlayerGroup : this.belowPlayerGroup, a[i].title);
				a[i].group.visible = a[i].visibleInGame;
			};
			for (var i = a.length - 1; i >= 0; i--) {
				a[i].group.parent.bringToTop(a[i].group);
			};

			this.layers = a;

			this.events.layersLoaded.dispatch(this.layers);
			if(cb) cb();
		}.bind(this))
	},
	getChunk: function(x,y,cb){
		var func = function(){
			var chunk = null;
			for (var i = 0; i < this.chunks.length; i++) {
				if(this.chunks[i].x === x && this.chunks[i].y === y){
					chunk = this.chunks[i];
					break;
				}
			};
			if(chunk){
				if(chunk.loaded){
					if(cb) cb(chunk);
				}
				else{
					//loading it
					chunk.events.loaded.addOnce(function(){
						if(cb) cb(chunk);
					});
				}
			}
			else{
				this.loadChunk(x,y,cb);
			}
		};
		//see if the layers are loaded
		if(this.layersLoaded){
			func.call(this);
		}
		else{
			this.events.layersLoaded.addOnce(func,this);
		}
	},
	loadChunk: function(x,y,cb){ //loads a chunk from the server
		var chunk = new this.Chunk(x,y,this);
		chunk.loading = true;

		this.chunks.push(chunk);

		server.emit('getChunk',{
			map: this.loadedMapID,
			x: x,
			y: y
		},function(data){
			chunk.loaded = true;
			chunk.loading = false;
			if(data){
				chunk.inportData(data);
			}
			this.events.chunkLoaded.dispatch(chunk);
			chunk.events.loaded.dispatch();
			if(cb) cb(chunk);
		}.bind(this))
	},
	getTile: function(x,y,l,cb){ //returns tile
		this.getChunk(Math.floor(x/16),Math.floor(y/16),function(chunk){
			var layer = chunk.getLayer(l);
			if(cb) cb(layer.getTile(x-(chunk.x*16),y-(chunk.y*16)));
		});
	},
	getTiles: function(from,to,cb){ //returns map data
		from = fn.combindIn({
			x: 0,
			y: 0,
			l: 0
		},from || {})
		to = fn.combindIn(fn.duplicate(from),to || {});
		to.x = (to.x < from.x)? from.x : to.x;
		to.y = (to.y < from.y)? from.y : to.y;
		to.l = (to.l < from.l)? from.l : to.l;
		cb = _.after(((to.l-from.l)+1)*((to.x-from.x)+1)*((to.y-from.y)+1),cb || function(){});

		var data = {
			x: from.x,
			y: from.y,
			width: (to.x - from.x)+1,
			height: (to.y - from.y)+1,
			data: [],
			primaryLayer: 0
		}

		for (var l = from.l; l <= to.l; l++) {
			for (var y = from.y; y <= to.y; y++) {
				for (var x = from.x; x <= to.x; x++) {
					this.getTile(x,y,l,function(x,y,l,tile){
						if(!data.data[l]){
							data.data[l] = [];
						}

						data.data[l].push(tile)

						cb(data);
					}.bind(this,x,y,l))
				};
			};
		};
	},
	setTile: function(x,y,l,t){
		this.getChunk(Math.floor(x/16),Math.floor(y/16),function(chunk){
			var layer = chunk.getLayer(l);
			if(cb) cb(layer.setTile(x-(chunk.x*16),y-(chunk.y*16),t));
		});
	},
	setTiles: function(data){ //puts map data on map
 		var activeLayer = data.activeLayer || 0;

		for (var l = 0; l < data.data.length; l++) {
			var layer = activeLayer + (l - data.primaryLayer);
			for (var t = 0; t < data.data[l].length; t++) {
				var x = data.x + (t-Math.floor(t/data.width)*data.width);
				var y = data.y + Math.floor(t/data.width);

				//see if its a -1 tile
				if(data.data[l][t] == -1){
					continue;
				}
				this.setTile(x,y,layer,data.data[l][t]);
			};
		};

		//loop through the rect and render all tiles
		var x = Math.floor(data.x/16);
		var y = Math.floor(data.y/16);
		var width = Math.floor((data.x+data.width)/16);
		var height = Math.floor((data.y+data.height)/16);
	},
	removeChunk: function(x,y){ //removes chunk from array
		for (var i = 0; i < this.chunks.length; i++) {
			if(this.chunks[i].x === x && this.chunks[i].y === y){
				this.chunk[i].remove();
				this.chunks.splice(i,1);
				return;
			}
		};
	},
	removeAllChunks: function(){ //removes all chunks 
		for (var i = 0; i < this.chunks.length; i++) {
			this.chunks[i].remove();
		};
		this.chunks = [];
	},
	loadMap: function(id,cb){
		if(this.loadingMap || id == this.loadedMapID) return;

		var map = this.getMap(id);
		if(map){
			this.loadingMap = true;

			//disable the keyboard
			keyBindings.enable('none');

			//dispach the event
			this.events.loadMap.dispatch(id);

			this.removeAllChunks();
			this.loadedMapID = id;

			this.scaleWorld();

			//recreate the collision map
			if(this.collisionLayer) this.collisionLayer.destroy();
			this.tilemap.removeAllLayers();
			this.collisionLayer = this.tilemap.createBlankLayer('Collision',this.loadedMap.width*16,this.loadedMap.height*16,this.tilemap.tileWidth,this.tilemap.tileHeight);
			this.collisionLayer.visible = page.menu.settings.graphics.debug();

			this.loadChunkTimer.pause();
			this.loadChunksInView(function(chunks){
				var func = _.after(chunks.length,function(){
					this.loadingMap = false;

					//enable the keyboard
					keyBindings.enable('game');

					if(cb) cb();
				});
				for (var i = 0; i < chunks.length; i++) {
					chunks[i].events.inportedData.addOnce(func,this);
				};

				//start chunkLoop
				this.loadChunkTimer.resume();
			}.bind(this));
		}
		else{
			console.error('failed to load map: '+id)
		}
	},
	scaleWorld: function(){
		var map = this.getMap(this.loadedMapID);
		if(map){
			engin.world.resize(map.width*16*32,map.height*16*32);
		}
	},
	loadChunksInView: function(cb){
		var chunks = [];
 		x = Math.floor((engin.camera.x - this.viewRange)/32/16);
 		y = Math.floor((engin.camera.y - this.viewRange)/32/16);
 		w = Math.ceil((engin.camera.x + engin.camera.width + this.viewRange)/32/16) - x;
 		h = Math.ceil((engin.camera.y + engin.camera.height + this.viewRange)/32/16) - y;

		var func = _.after(w*h,function(){
			if(cb) cb(chunks);
		}.bind(this));

 		for (var i = 0; i < h; i++) {
 			for (var k = 0; k < w; k++) {
 				//see if its in the world
				if(x+k >= 0 && x+k < this.loadedMap.width && y+i >= 0 && y+i < this.loadedMap.height){
					this.getChunk(x+k,y+i,function(chunk){
						chunks.push(chunk);
						func();
					});
				}
				else{
					func();
				}
			};
		};	
 	},
}

map.__defineGetter__('loadedMap',function(){
	return this.getMap(this.loadedMapID) || {
		id: -1,
		width: 0,
		hegiht: 0,
		name: '',
		desc: ''
	};
})
map = {
	Chunk: function(x,y,map){
		this.x = x;
		this.y = y;
		this.width = 16;
		this.height = 16;
		this._layers = []
		this.map = map;
		this.loaded = false;

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
					var l = new map.Layer(map.layers[i].id,this,map.layers[i].tilemapLayer);
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
			for (var i = 0; i < data.data.length; i++) {
				if(a[i]){
					a[i].inportData(data.data[i]);
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
		this.layer = layer; //phaser tilemap layer
		// this.bitmap = engin.add.bitmapData(this.width*32,this.height*32,'',false);

		this.getTile = function(x,y){
			return map.tilemap.getTile(this.chunk.tileX + x, this.chunk.tileY + y,this.layer)
		}
		this.setTile = function(x,y,t){
			map.tilemap.putTile(t,this.chunk.tileX + x, this.chunk.tileY + y,this.layer);
		}
		this.removeTile = function(x,y){
			map.tilemap.removeTile(this.chunk.tileX + x, this.chunk.tileY + y,this.layer);
		}
		this.remove = function(){
			//remove all tiles
			for (var x = 0; x < this.chunk.width; x++) {
				for (var y = 0; y < this.chunk.height; y++) {
					this.removeTile(x,y);
				};
			};
		}

		this.inportData = function(data){ //inports a array of tiles (256 length)
			var func = function(data,i){
				y = Math.floor(i/this.chunk.width);
				x = i-(y*this.chunk.width);
				this.setTile(x,y,data[i])

				if(++i < data.length){
					setTimeout(func.bind(this,data,i),1);
				}
			}
			setTimeout(func.bind(this,data,0),1);
			// for (var i = 0; i < data.length; i++) {
			// 	y = Math.floor(i/this.chunk.width);
			// 	x = i-(y*this.chunk.width);
			// 	this.setTile(x,y,data[i])

			// 	var layer = map.tilemap.getLayer(this.layer);
			// 	map.tilemap.layers[layer].dirty = false;
			// };
		}
	},

	loadedMap: -1,
	defaultTile: 0,
	layersLoaded: false,
	tilemap: undefined,
	abovePlayerGroup: undefined,
	belowPlayerGroup: undefined,
	tilesets: [],
	chunks: [],
	layers: [],
	maps: [],

	/*
	events:
	chunkLoaded-x-y
	layersLoaded
	*/
	events: new EventEmitter(),

	init: function(){
		this.tilemap = engin.add.tilemap(null,32,32,100,100);
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

		this.loadChunkLoop();

		this.events.setMaxListeners(100);
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
			this.tilemap.removeAllLayers();
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
				a[i].tilemapLayer = this.tilemap.createBlankLayer(a[i].title,100,100,this.tilemap.tileWidth,this.tilemap.tileHeight);
				a[i].tilemapLayer.visible = a[i].visibleInGame;
				if(a[i].abovePlayer){
					this.abovePlayerGroup.add(a[i].tilemapLayer);
				}
				else{
					this.belowPlayerGroup.add(a[i].tilemapLayer);
				}
			};
			for (var i = a.length - 1; i >= 0; i--) {
				a[i].tilemapLayer.bringToTop();
			};

			this.layers = a;

			this.events.emit('layersLoaded');
			if(cb) cb();
		}.bind(this))
	},
	alignLayers: function(){
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
					if(cb){
						this.events.once('chunkLoaded-'+chunk.x+'-'+chunk.y,cb);
					}
				}
			}
			else{
				this.loadChunk(x,y,cb);
			}
		};
		if(this.layersLoaded){
			func.call(this);
		}
		else{
			this.events.once('layersLoaded',func.bind(this));
		}
	},
	loadChunk: function(x,y,cb){ //loads a chunk from the server
		var chunk = new this.Chunk(x,y,this);

		this.chunks.push(chunk);

		server.emit('getChunk',{
			map: this.loadedMap,
			x: x,
			y: y
		},function(data){
			chunk.loaded = true;
			if(data){
				chunk.inportData(data);
			}
			this.events.emit('chunkLoaded-'+chunk.x+'-'+chunk.y,chunk);
			if(cb) cb(chunk);
		}.bind(this))
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
		var map = this.getMap(id);
		if(map){
			if(id !== this.loadedMap){
				this.removeAllChunks();
			}
			this.loadedMap = id;

			engin.world.resize(map.width*16*32,map.height*16*32);
		}
		else{
			console.error('failed to load map: '+id)
		}
		
		if(cb) cb();
	},
	loadChunkLoop: function(){
		if(server.connected){
	 		x = Math.floor(engin.camera.x/32/16);
	 		y = Math.floor(engin.camera.y/32/16);
	 		w = Math.ceil((engin.camera.x+engin.camera.width)/32/16) - x;
	 		h = Math.ceil((engin.camera.y+engin.camera.height)/32/16) - y;
	 		for (var i = 0; i < h; i++) {
	 			for (var k = 0; k < w; k++) {
					this.getChunk(x+k,y+i);
				};
			};	
		}
		 
		setTimeout(this.loadChunkLoop.bind(this),500);
 	},
}
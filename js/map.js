function array(val, length) {
	a = new Array();
	for (var i = 0; i < length; i++) {
		a[i] = val;
	}
	return a;
}

map = {
	Chunk: function(x, y, map) {
		this.x = x;
		this.y = y;
		this.width = 16;
		this.height = 16;
		this._layers = [];
		this.map = map;
		this.loaded = false;
		this.loading = false;

		this.events = {
			loaded: new Phaser.Signal(),
			inportedData: new Phaser.Signal(),
		};

		//acts as the layers array
		this.__defineGetter__("layers", function() {
			//syncs layers with map
			if (!this.loaded) return [];
			if (!map.layersLoaded) return [];
			var a = [];
			for (var i = 0; i < map.layers.length; i++) {
				s = false;
				for (var k = 0; k < this._layers.length; k++) {
					if (this._layers[k].id === map.layers[i].id) {
						this._layers[k].index = i;
						//move it to the new array
						a.push(this._layers[k]);
						this._layers.splice(k, 1);
						s = true;
						break;
					}
				}
				if (!s) {
					var l = new map.Layer(map.layers[i].id, this, map.layers[i]);
					l.index = i;
					a.push(l);
				}
			}
			//loop through the old list and remove one that are there (layers that are used are moved to the array "a")
			for (var i = 0; i < this._layers.length; i++) {
				this._layers[i].remove();
			}
			this._layers = a;
			return a;
		});
		this.getLayer = function(i) {
			if (this.layerLoaded(i)) {
				return this.layers[i];
			} else {
				return new MapLayer(-1, this);
			}
		};
		this.layerLoaded = function(i) {
			return this.layers[i] !== undefined;
		};
		this.remove = function() {
			//removes chunk images from the svg
			var a = this.layers;
			for (var i = 0; i < a.length; i++) {
				a[i].remove();
			}
		};
		this.inportData = function(data) {
			//inports data from server format
			this.loaded = true;
			a = this.layers;
			cb = _.after(
				a.length,
				function() {
					this.events.inportedData.dispatch(this);
				}.bind(this)
			);

			for (var i = 0; i < data.data.length; i++) {
				if (a[i]) {
					a[i].inportData(data.data[i], cb);
				}
			}
		};

		this.__defineGetter__("tileX", function() {
			return this.x * this.width;
		});

		this.__defineGetter__("tileY", function() {
			return this.y * this.height;
		});
	},
	Layer: function(id, chunk, layer) {
		this.id = id;
		this.chunk = chunk;
		this.layer = layer; //map.layers
		this.tiles = new array(map.defaultTile, this.chunk.width * this.chunk.height);
		this.bitmap = engin.add.bitmapData(this.chunk.width * 32, this.chunk.height * 32);
		this.sprite = this.bitmap.addToWorld(this.chunk.x * 16 * 32, this.chunk.y * 16 * 32);
		this.sprite.name = this.chunk.x + "|" + this.chunk.y;
		this.layer.group.add(this.sprite);

		this.getTile = function(x, y) {
			return this.tiles[y * this.chunk.width + x];
		};
		this.setTile = function(x, y, t, dontDraw) {
			var tile = this.tiles[y * this.chunk.width + x];
			tile.index = t;
			//draw tile
			if (!dontDraw) {
				for (var i = map.tilemap.tilesets.length - 1; i >= 0; i--) {
					if (map.tilemap.tilesets[i].containsTileIndex(t)) {
						//test to see if its a blank tile ------going to have to change this-----------
						if (t == map.defaultTile) {
							this.bitmap.ctx.clearRect(x * 32, y * 32, map.tilemap.tileWidth, map.tilemap.tileHeight);
						} else {
							map.tilemap.tilesets[i].draw(this.bitmap.ctx, x * 32, y * 32, t);
						}
					}
				}

				this.bitmap.dirty = true;
			}
		};
		this.remove = function() {
			for (var x = 0; x < this.chunk.width; x++) {
				for (var y = 0; y < this.chunk.height.length; y++) {
					this.setTile(x, y, map.defaultTile, true);
				}
			}
			this.sprite.destroy();
		};

		this.inportData = function(data, cb) {
			//inports a array of tiles (256 length)
			var done = function() {
				this.bitmap.dirty = true; //render it
				engin.add.tween(this.sprite).to({ alpha: 1 }, 500, "Linear", true);
				if (cb) cb();
			};
			var func = function(data, i) {
				var a = false;
				for (var k = 0; k < 4; k++) {
					y = Math.floor(i / this.chunk.width);
					x = i - y * this.chunk.width;
					this.setTile(x, y, data[i]);
					this.bitmap.dirty = false; //dont render it yet
					i++;

					if (i >= data.length) {
						a = true;
					}
				}

				if (!a) {
					setTimeout(func.bind(this, data, i), 1);
				} else {
					done.call(this);
				}
			};
			this.sprite.alpha = 0;
			setTimeout(func.bind(this, data, 0), 1);
		};

		for (var i = 0; i < this.tiles.length; i++) {
			this.tiles[i] = new Tile(
				this,
				this.tiles[i],
				i - Math.floor(i / this.chunk.width) * this.chunk.width,
				Math.floor(i / this.chunk.width),
				map.tilemap.tileWidth,
				map.tilemap.tileHeight
			);
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
	collisionGroup: undefined,
	tilesets: [],
	tileProperties: [],
	chunks: [],
	layers: [],
	maps: [],

	events: {
		loadMap: new Phaser.Signal(), //dispached before a new map is loaded
		chunkLoaded: new Phaser.Signal(),
		layersLoaded: new Phaser.Signal(),
	},
	loadChunkTimer: undefined,

	init: function() {
		this.tilemap = engin.add.tilemap(null, 32, 32);
		this.tilemap.removeAllLayers();
		this.abovePlayerGroup = engin.add.group(abovePlayerGroup, "mapLayers");
		this.belowPlayerGroup = engin.add.group(belowPlayerGroup, "mapLayers");
		abovePlayerGroup.moveDown(this.abovePlayerGroup);

		//load tilesets
		for (var i = 0; i < this.tilesets.length; i++) {
			var gid = 0;
			if (i !== 0) {
				gid = this.tilemap.tilesets[i - 1].firstgid + this.tilemap.tilesets[i - 1].total;
			}
			this.tilemap.addTilesetImage(this.tilesets[i].name, this.tilesets[i].name, 32, 32, 0, 0, gid);
		}

		//load loop
		this.loadChunkTimer = engin.time.create(false);
		var func = function() {
			this.loadChunksInView.call(this);

			this.loadChunkTimer.add(1000, func, this);
		};
		this.loadChunkTimer.add(1000, func, this);
		this.loadChunkTimer.start();
		this.loadChunkTimer.pause();
	},
	getMap: function(mapID) {
		for (var i = this.maps.length - 1; i >= 0; i--) {
			if (this.maps[i].id == mapID) {
				return this.maps[i];
			}
		}
	},
	loadLayers: function(cb) {
		//load layers
		server.emit(
			"getLayers",
			function(data) {
				this.layersLoaded = true;
				var a = new SortedArray(data, function(a, b) {
					if (a.abovePlayer === b.abovePlayer) {
						if (a.level === b.level) {
							return 0;
						} else if (a.level < b.level) {
							return 1;
						} else {
							return -1;
						}
					} else if (a.abovePlayer < b.abovePlayer) {
						return 1;
					} else {
						return -1;
					}
				});
				//add layers
				for (var i = 0; i < a.length; i++) {
					a[i].group = engin.add.group(a[i].abovePlayer ? this.abovePlayerGroup : this.belowPlayerGroup, a[i].title);
					a[i].group.visible = a[i].visibleInGame;
				}
				for (var i = a.length - 1; i >= 0; i--) {
					a[i].group.parent.bringToTop(a[i].group);
				}

				this.layers = a;

				this.events.layersLoaded.dispatch(this.layers);
				if (cb) cb();
			}.bind(this)
		);
	},
	getChunk: function(x, y, cb) {
		var func = function() {
			var chunk = null;
			for (var i = 0; i < this.chunks.length; i++) {
				if (this.chunks[i].x === x && this.chunks[i].y === y) {
					chunk = this.chunks[i];
					break;
				}
			}
			if (chunk) {
				if (chunk.loaded) {
					if (cb) cb(chunk);
				} else {
					//loading it
					chunk.events.loaded.addOnce(function() {
						if (cb) cb(chunk);
					});
				}
			} else {
				this.loadChunk(x, y, cb);
			}
		};
		//see if the layers are loaded
		if (this.layersLoaded) {
			func.call(this);
		} else {
			this.events.layersLoaded.addOnce(func, this);
		}
	},
	loadChunk: function(x, y, cb) {
		//loads a chunk from the server
		var chunk = new this.Chunk(x, y, this);
		chunk.loading = true;

		this.chunks.push(chunk);

		server.emit(
			"getChunk",
			{
				map: this.loadedMapID,
				x: x,
				y: y,
			},
			function(data) {
				chunk.loaded = true;
				chunk.loading = false;
				if (data) {
					chunk.inportData(data);
				}
				this.events.chunkLoaded.dispatch(chunk);
				chunk.events.loaded.dispatch();
				if (cb) cb(chunk);
			}.bind(this)
		);
	},
	getTile: function(x, y, l, cb, raw) {
		//returns tile
		this.getChunk(Math.floor(x / 16), Math.floor(y / 16), function(chunk) {
			var layer = chunk.getLayer(l);
			var tile = layer.getTile(x - chunk.x * 16, y - chunk.y * 16);
			if (cb) cb(raw ? tile.index : tile);
		});
	},
	getTiles: function(from, to, cb, raw) {
		//returns map data
		from = fn.combindIn(
			{
				x: 0,
				y: 0,
				l: 0,
			},
			from || {}
		);
		to = fn.combindIn(fn.duplicate(from), to || {});
		to.x = to.x < from.x ? from.x : to.x;
		to.y = to.y < from.y ? from.y : to.y;
		to.l = to.l < from.l ? from.l : to.l;
		cb = _.after((to.l - from.l + 1) * (to.x - from.x + 1) * (to.y - from.y + 1), cb || function() {});

		var data = {
			x: from.x,
			y: from.y,
			width: to.x - from.x + 1,
			height: to.y - from.y + 1,
			data: [],
			primaryLayer: 0,
		};

		for (var l = from.l; l <= to.l; l++) {
			for (var y = from.y; y <= to.y; y++) {
				for (var x = from.x; x <= to.x; x++) {
					this.getTile(
						x,
						y,
						l,
						function(x, y, l, tile) {
							if (!data.data[l]) {
								data.data[l] = [];
							}

							data.data[l].push(raw ? tile.index : tile);

							cb(data);
						}.bind(this, x, y, l)
					);
				}
			}
		}
	},
	setTile: function(x, y, l, t) {
		this.getChunk(Math.floor(x / 16), Math.floor(y / 16), function(chunk) {
			var layer = chunk.getLayer(l);
			if (cb) cb(layer.setTile(x - chunk.x * 16, y - chunk.y * 16, t));
		});
	},
	setTiles: function(data) {
		//puts map data on map
		var activeLayer = data.activeLayer || 0;

		for (var l = 0; l < data.data.length; l++) {
			var layer = activeLayer + (l - data.primaryLayer);
			for (var t = 0; t < data.data[l].length; t++) {
				var x = data.x + (t - Math.floor(t / data.width) * data.width);
				var y = data.y + Math.floor(t / data.width);

				//see if its a -1 tile
				if (data.data[l][t] == -1) {
					continue;
				}
				this.setTile(x, y, layer, data.data[l][t]);
			}
		}

		//loop through the rect and render all tiles
		var x = Math.floor(data.x / 16);
		var y = Math.floor(data.y / 16);
		var width = Math.floor((data.x + data.width) / 16);
		var height = Math.floor((data.y + data.height) / 16);
	},
	removeChunk: function(x, y) {
		//removes chunk from array
		for (var i = 0; i < this.chunks.length; i++) {
			if (this.chunks[i].x === x && this.chunks[i].y === y) {
				this.chunk[i].remove();
				this.chunks.splice(i, 1);
				return;
			}
		}
	},
	removeAllChunks: function() {
		//removes all chunks
		for (var i = 0; i < this.chunks.length; i++) {
			this.chunks[i].remove();
		}
		this.chunks = [];
	},
	loadMap: function(id, cb) {
		if (this.loadingMap || id == this.loadedMapID) return;

		var map = this.getMap(id);
		if (map) {
			this.loadingMap = true;

			//disable the keyboard
			keyBindings.enable("none");

			//dispach the event
			this.events.loadMap.dispatch(id);

			this.removeAllChunks();
			this.loadedMapID = id;

			this.scaleWorld();

			this.loadChunkTimer.pause();
			this.loadChunksInView(
				function(chunks) {
					var func = _.after(chunks.length, function() {
						this.loadingMap = false;

						//enable the keyboard
						keyBindings.enable("game");

						if (cb) cb();
					});
					for (var i = 0; i < chunks.length; i++) {
						chunks[i].events.inportedData.addOnce(func, this);
					}

					//start chunkLoop
					this.loadChunkTimer.resume();
				}.bind(this)
			);
		} else {
			console.error("failed to load map: " + id);
		}
	},
	scaleWorld: function() {
		var map = this.getMap(this.loadedMapID);
		if (map) {
			var w = map.width * 16 * this.tilemap.tileWidth;
			var h = map.height * 16 * this.tilemap.tileHeight;

			if (w < engin.width) {
				w = w + (engin.width - w) / 2;
			}
			if (h < engin.height) {
				h = h + (engin.height - h) / 2;
			}

			engin.world.resize(w, h);
		}
	},
	loadChunksInView: function(cb) {
		var chunks = [];
		x = Math.floor((engin.camera.x - this.viewRange) / 32 / 16);
		y = Math.floor((engin.camera.y - this.viewRange) / 32 / 16);
		w = Math.ceil((engin.camera.x + engin.camera.width + this.viewRange) / 32 / 16) - x;
		h = Math.ceil((engin.camera.y + engin.camera.height + this.viewRange) / 32 / 16) - y;

		var func = _.after(
			w * h,
			function() {
				if (cb) cb(chunks);
			}.bind(this)
		);

		for (var i = 0; i < h; i++) {
			for (var k = 0; k < w; k++) {
				//see if its in the world
				if (x + k >= 0 && x + k < this.loadedMap.width && y + i >= 0 && y + i < this.loadedMap.height) {
					this.getChunk(x + k, y + i, function(chunk) {
						chunks.push(chunk);
						func();
					});
				} else {
					func();
				}
			}
		}
	},
	tilePropertiesChange: function(data) {
		if (data.blank === undefined) {
			for (var i in data) {
				this.tileProperties[data[i].id] = data[i];
				delete this.tileProperties[data[i].id].id;
			}
		} else {
			this.tileProperties[data.id] = data;
			delete this.tileProperties[data.id].id;
		}
	},
	collide: function(sprite) {
		if (!sprite.body || !this.layersLoaded || this.loadingMap) {
			return;
		}

		var size = 1;
		for (var l = 0; l < this.layers.length; l++) {
			if (this.layers[l].collision) {
				this.getTiles(
					{
						x: Math.floor(sprite.body.position.x / this.tilemap.tileWidth) - size,
						y: Math.floor(sprite.body.position.y / this.tilemap.tileHeight) - size,
						l: l,
					},
					{
						x: Math.floor(sprite.body.position.x / this.tilemap.tileWidth) + size,
						y: Math.floor(sprite.body.position.y / this.tilemap.tileHeight) + size,
						l: l,
					},
					function(data) {
						for (var t = 0; t < data.data[0].length; t++) {
							this.separateTile(t, sprite.body, data.data[0][t]);
						}
					}.bind(this)
				);
			}
		}
	},
	separateTile: function(i, body, tile) {
		//  We re-check for collision in case body was separated in a previous step
		if (!body.enable || !tile.intersects(body.position.x, body.position.y, body.right, body.bottom) || !tile.collides) {
			//  no collision so bail out (separated in a previous step)
			return false;
		}

		var ox = 0;
		var oy = 0;
		var minX = 0;
		var minY = 1;

		if (body.deltaAbsX() > body.deltaAbsY()) {
			//  Moving faster horizontally, check X axis first
			minX = -1;
		} else if (body.deltaAbsX() < body.deltaAbsY()) {
			//  Moving faster vertically, check Y axis first
			minY = -1;
		}

		if (body.deltaX() !== 0 && body.deltaY() !== 0) {
			//  We only need do this if both axis have checking faces AND we're moving in both directions
			minX = Math.min(Math.abs(body.position.x - tile.right), Math.abs(body.right - tile.left));
			minY = Math.min(Math.abs(body.position.y - tile.bottom), Math.abs(body.bottom - tile.top));
		}

		if (minX < minY) {
			ox = this.tileCheckX(body, tile);

			//  That's horizontal done, check if we still intersects? If not then we can return now
			if (ox !== 0 && !tile.intersects(body.position.x, body.position.y, body.right, body.bottom)) {
				return true;
			}
			oy = this.tileCheckY(body, tile);
		} else {
			oy = this.tileCheckY(body, tile);

			//  That's vertical done, check if we still intersects? If not then we can return now
			if (oy !== 0 && !tile.intersects(body.position.x, body.position.y, body.right, body.bottom)) {
				return true;
			}
			ox = this.tileCheckX(body, tile);
		}
		return ox !== 0 || oy !== 0;
	},
	tileCheckX: function(body, tile) {
		var ox = 0;

		if (body.deltaX() < 0 && !body.blocked.left && body.checkCollision.left) {
			//  Body is moving LEFT
			if (body.x < tile.right) {
				ox = body.x - tile.right;

				if (ox < -engin.physics.arcade.TILE_BIAS) {
					ox = 0;
				}
			}
		} else if (body.deltaX() > 0 && !body.blocked.right && body.checkCollision.right) {
			//  Body is moving RIGHT
			if (body.right > tile.left) {
				ox = body.right - tile.left;

				if (ox > engin.physics.arcade.TILE_BIAS) {
					ox = 0;
				}
			}
		}

		if (ox !== 0) {
			engin.physics.arcade.processTileSeparationX(body, ox);
		}

		return ox;
	},
	tileCheckY: function(body, tile) {
		var oy = 0;

		if (body.deltaY() < 0 && !body.blocked.up && body.checkCollision.up) {
			//  Body is moving UP
			if (body.y < tile.bottom) {
				oy = body.y - tile.bottom;

				if (oy < -engin.physics.arcade.TILE_BIAS) {
					oy = 0;
				}
			}
		} else if (body.deltaY() > 0 && !body.blocked.down && body.checkCollision.down) {
			//  Body is moving DOWN
			if (body.bottom > tile.top) {
				oy = body.bottom - tile.top;

				if (oy > engin.physics.arcade.TILE_BIAS) {
					oy = 0;
				}
			}
		}

		if (oy !== 0) {
			engin.physics.arcade.processTileSeparationY(body, oy);
		}

		return oy;
	},
};

map.__defineGetter__("loadedMap", function() {
	return (
		this.getMap(this.loadedMapID) || {
			id: -1,
			width: 0,
			hegiht: 0,
			name: "",
			desc: "",
		}
	);
});

function Tile() {
	Phaser.Tile.prototype.constructor.apply(this, arguments);
}
Tile.prototype = {
	containsPoint: function(x, y) {
		return !(x < this.left || y < this.top || x > this.right || y > this.bottom);
	},
	intersects: function(x, y, right, bottom) {
		if (right <= this.left) {
			return false;
		}
		if (bottom <= this.top) {
			return false;
		}
		if (x >= this.right) {
			return false;
		}
		if (y >= this.bottom) {
			return false;
		}
		return true;
	},
	setCollisionCallback: function(callback, context) {
		this.collisionCallback = callback;
		this.collisionCallbackContext = context;
	},
	destroy: function() {
		this.collisionCallback = null;
		this.collisionCallbackContext = null;
		this.properties = null;
	},
	setCollision: function(left, right, up, down) {
		this.collideLeft = left;
		this.collideRight = right;
		this.collideUp = up;
		this.collideDown = down;

		this.faceLeft = left;
		this.faceRight = right;
		this.faceTop = up;
		this.faceBottom = down;
	},
	resetCollision: function() {
		this.collideLeft = false;
		this.collideRight = false;
		this.collideUp = false;
		this.collideDown = false;

		this.faceTop = false;
		this.faceBottom = false;
		this.faceLeft = false;
		this.faceRight = false;
	},
	isInteresting: function(collides, faces) {
		if (collides && faces) {
			//  Does this tile have any collide flags OR interesting face?
			return (
				this.collideLeft ||
				this.collideRight ||
				this.collideUp ||
				this.collideDown ||
				this.faceTop ||
				this.faceBottom ||
				this.faceLeft ||
				this.faceRight ||
				this.collisionCallback
			);
		} else if (collides) {
			//  Does this tile collide?
			return this.collideLeft || this.collideRight || this.collideUp || this.collideDown;
		} else if (faces) {
			//  Does this tile have an interesting face?
			return this.faceTop || this.faceBottom || this.faceLeft || this.faceRight;
		}
		return false;
	},
	copy: function(tile) {
		this.index = tile.index;
		this.alpha = tile.alpha;
		this.properties = tile.properties;

		this.collideUp = tile.collideUp;
		this.collideDown = tile.collideDown;
		this.collideLeft = tile.collideLeft;
		this.collideRight = tile.collideRight;

		this.collisionCallback = tile.collisionCallback;
		this.collisionCallbackContext = tile.collisionCallbackContext;
	},
};
Object.defineProperty(Tile.prototype, "properties", {
	get: function() {
		return (
			map.tileProperties[this.index] || {
				blank: false,
				collision: false,
				collisionInfo: {
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
				},
			}
		);
	},
});
Object.defineProperty(Tile.prototype, "worldX", {
	get: function() {
		return (this.x + this.layer.chunk.x * this.layer.chunk.width) * map.tilemap.tileWidth;
	},
});
Object.defineProperty(Tile.prototype, "worldY", {
	get: function() {
		return (this.y + this.layer.chunk.y * this.layer.chunk.height) * map.tilemap.tileHeight;
	},
});
Object.defineProperty(Tile.prototype, "collides", {
	get: function() {
		return this.properties.collision;
	},
});
Object.defineProperty(Tile.prototype, "canCollide", {
	get: function() {
		return this.collideLeft || this.collideRight || this.collideUp || this.collideDown || this.collisionCallback;
	},
});
Object.defineProperty(Tile.prototype, "left", {
	get: function() {
		return this.worldX + this.width * this.properties.collisionInfo.left;
	},
});
Object.defineProperty(Tile.prototype, "right", {
	get: function() {
		return this.worldX + this.width - this.width * this.properties.collisionInfo.right;
	},
});
Object.defineProperty(Tile.prototype, "top", {
	get: function() {
		return this.worldY + this.height * this.properties.collisionInfo.top;
	},
});
Object.defineProperty(Tile.prototype, "bottom", {
	get: function() {
		return this.worldY + this.height - this.height * this.properties.collisionInfo.bottom;
	},
});

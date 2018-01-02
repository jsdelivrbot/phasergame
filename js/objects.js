objects = {
	objects: [],
	objectTypes: {},
	gridSize: 32,
	group: undefined,
	events: {
		objectLoaded: new Phaser.Signal()
	},

	init: function() {
		this.group = engin.add.group();
		this.group.name = "Objects";
		this.group.visible = false;
		abovePlayerGroup.add(this.group);

		//listen for chunks loading
		map.events.chunkLoaded.add(function(chunk) {
			this.getObjectsOnPosition(
				{
					map: map.loadedMapID,
					x: chunk.x * chunk.width,
					y: chunk.y * chunk.height,
					width: chunk.width,
					height: chunk.height
				},
				function() {}
			);
		}, this);

		map.events.loadMap.add(function(mapID) {
			this.removeAllObjects();
		}, this);
	},

	step: function() {
		for (var i = 0; i < this.objects.length; i++) {
			this.objects[i].step();
		}
	},

	getObject: function(id, type, cb) {
		//get obj from array
		for (var i = 0; i < this.objects.length; i++) {
			if (this.objects[i].id === id && this.objects[i].type === type) {
				if (cb) cb(this.objects[i]);
				return;
			}
		}
		//if its not loaded
		this.loadObject(id, type, cb);
	},
	getObjectsOnPosition: function(position, cb) {
		var objs = [];
		var k = 0;
		for (var i in this.objectTypes) {
			k++;
		}
		cb = _.after(k, cb || function() {});

		for (var i in this.objectTypes) {
			server.emit(
				"getObjects",
				{
					type: i,
					from: {
						map: position.map,
						x: position.x,
						y: position.y
					},
					to: {
						map: position.map,
						x: position.x + position.width,
						y: position.y + position.height
					}
				},
				function(data) {
					for (var i = 0; i < data.length; i++) {
						if (this.objectLoaded(data[i].id, data[i].type)) {
							//load it
							this.getObject(
								data[i].id,
								data[i].type,
								function(data, obj) {
									obj.inportData(data);
									objs.push(obj);
								}.bind(this, data[i])
							);
						} else {
							//create it
							var obj = new this.objectTypes[data[i].type](data[i].id, data[i], this);
							this.objects.push(obj);
							objs.push(obj);
						}
					}
					cb(objs);
				}.bind(this)
			);
		}
	},
	loadObject: function(id, type, cb) {
		//loads obj from the server
		if (!this.typeExists(type)) return;

		var obj = new this.objectTypes[type](id, {}, this);
		obj.loading = true;
		this.objects.push(obj);

		server.emit(
			"getObject",
			{
				id: id,
				type: type
			},
			function(data) {
				//see if its real
				if (data.id !== -1) {
					obj.inportData(data);
					obj.loading = false;
					this.evnets.objectLoaded.dispatch(obj);
					obj.events.load.dispatch();
				}
				if (cb) cb(obj);
			}.bind(this)
		);
	},
	createObject: function(type, data, cb) {
		//creates in db, and loads it
		if (!this.typeExists(type)) return;

		server.emit("objectCreate", {
			type: type,
			data: data
		});
	},
	deleteObject: function(id, type) {
		//removes obj from db
		server.emit("objectDelete", {
			id: id,
			type: type
		});
	},
	typeExists: function(type) {
		//checks if obj type exists
		return this.objectTypes[type] !== undefined;
	},
	objectLoaded: function(id, type) {
		//checks if obj is loaded
		for (var i = 0; i < this.objects.length; i++) {
			if (this.objects[i].id === id && this.objects[i].id === id) {
				return true;
			}
		}
		return false;
	},
	removeObject: function(id, type) {
		//removes obj from array
		for (var i = 0; i < this.objects.length; i++) {
			if (this.objects[i].id === id && this.objects[i].id === id) {
				this.objects[i].remove();
				this.objects.splice(i, 1);
			}
		}
	},
	removeAllObjects: function() {
		//removes all objs
		for (var i = 0; i < this.objects.length; i++) {
			this.objects[i].remove();
		}
		this.objects = [];
	},

	//server events
	objectChange: function(data) {
		//event from server when a objs change, "objs" is an array of objs
		if (this.objectLoaded(data.id, data.type)) {
			this.getObject(data.id, data.type, function(obj) {
				obj.inportData(data);
			});
		}
	},
	objectCreate: function(data) {
		//event for when a obj is created
		//see if its on my map
		if (data.map == map.loadedMapID) {
			//create a obj and add it to the array
			var obj = new this.objectTypes[data.type](data.id, data, this);
			this.objects.push(obj);
		}
	},
	objectDelete: function(data) {
		if (this.objectLoaded(data.id, data.type)) {
			this.removeObject(data.id, data.type);
		}
	}
};

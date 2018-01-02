baseObject = function(id, data, objectController) {
	if (!objectController) throw new Error("objectController missing");

	this.id = id || this.id;
	this.controller = objectController;
	this.properties = fn.duplicate(this.properties);

	this.events = {
		load: new Phaser.Signal()
	};

	this.sprite = engin.make.sprite(this.x, this.y, "object-" + this.type);
	this.sprite.name = this.type + "-" + this.id;
	this.controller.group.add(this.sprite);

	this.inportData(data);
};
baseObject.prototype = {
	id: -1,
	type: "",
	x: 0,
	y: 0,
	map: -1,
	width: 1,
	height: 1,
	properties: {},
	controller: null,
	sprite: null,
	loading: false,
	events: {},
	step: function() {},
	inportData: function(data) {
		//inports obj from server format
		data = data || {};

		fn.combindOver(this, data);

		this.sprite.width = this.width * 32;
		this.sprite.height = this.height * 32;
		this.sprite.x = this.x * this.controller.gridSize;
		this.sprite.y = this.y * this.controller.gridSize;
	},
	exportData: function(data) {
		//exports to server format
		return {
			id: this.id,
			type: this.type,
			x: this.x,
			y: this.y,
			map: this.map,
			width: this.width,
			height: this.height,
			properties: this.properties
		};
	},
	remove: function() {
		this.sprite.destroy();
	}
};
baseObject.prototype.constructor = baseObject;

doorObject = function(id, data, objectController) {
	baseObject.prototype.constructor.apply(this, arguments);
};
doorObject.prototype = fn.combindOver(fn.duplicate(baseObject.prototype), {
	type: "door",
	width: 1,
	height: 1,
	x: 0,
	y: 0,
	properties: {
		x: 0,
		y: 0,
		map: -1
	},
	step: function() {
		if (
			Math.abs(players.player.x - this.sprite.x) < 48 &&
			Math.abs(players.player.y - this.sprite.y) < 48 &&
			keyBindings.game.interact.isDown() &&
			!map.loadingMap
		) {
			if (map.getMap(this.properties.map)) {
				players.player.x = this.properties.x * map.tilemap.tileWidth;
				players.player.y = this.properties.y * map.tilemap.tileHeight;
				players.player.map = this.properties.map;
			}
		}
	}
});
doorObject.prototype.constructor = doorObject;
//add it
objects.objectTypes.door = doorObject;

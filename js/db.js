db = {
	db: null,
	init: function(cb) {
		db.db = indexed("db").create(function(err) {
			if (err) console.error(err);
			console.log("opened DB");
			db.db = indexed("db");

			if (cb) cb();
		});
	},
	save: function(id, saveData, cb) {
		this.db.find(
			{
				id: id
			},
			function(err, data) {
				if (err) throw err;

				if (data.length) {
					this.db.update(
						{
							id: id
						},
						{
							data: JSON.stringify(saveData)
						},
						function() {
							if (cb) cb();
						}.bind(this)
					);
				} else {
					this.db.insert(
						{
							id: id,
							data: JSON.stringify(saveData)
						},
						function() {
							if (cb) cb();
						}.bind(this)
					);
				}
			}.bind(this)
		);
	},
	load: function(id, cb) {
		this.db.find(
			{
				id: id
			},
			function(err, data) {
				if (err) throw err;

				if (data.length) {
					data[0].data = JSON.parse(data[0].data);
					if (cb) cb(data[0]);
				} else {
					if (cb) cb();
				}
			}.bind(this)
		);
	}
};

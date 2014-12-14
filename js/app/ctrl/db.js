db = {
	db: null,
	init: function(cb){
		db.db = indexed('db').create(function(err){
			if(err) console.error(err);
			console.log('opened DB')
			db.db = indexed('db')

			if(cb) cb = _.after(1,cb);

			//set the the stores
			db.db.find({
				type: 'settings'
			},function(err,data){
				if(err) throw err;

				if(data.length == 0){
					db.db.insert({
						type: 'settings',
						settings: '{}'
					},function(){
						if(cb) cb();
					})
				}
				else{
					if(cb) cb();
				}
			})
		})
	}
}
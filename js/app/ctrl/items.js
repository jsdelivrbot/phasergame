items = {
	items: {},
	json: {},
	setItems: function(json){
		//parse the json, and turn it into an array of ids
		func = function(str,obj){
			for(var i in obj){
				if(obj[i].title){
					//its an item
					items.items[str+i] = obj[i];
				}
				else{
					//it a type
					func(str+i+'.',obj[i]);
				}
			}
		}

		func('',json);
		items.json = json;
	},
	get: function(id){
		return items.items[id] || null;
	}
}
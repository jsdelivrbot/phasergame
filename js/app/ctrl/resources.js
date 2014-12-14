/*
resource format
{
	id: '',
	resourceID: this is the id in resources.json
	position: {
		map: mapID,
		x: in tiles,
		y: in tiles,
	},
	size: {
		w: in pixels
		h: in pixels
	}
	mined: false,
	obj: only on client side
}
*/

maps.resources = {
	json: {},
	resources: {},
	setJson: function(json){
		//parse the json, and turn it into an array of ids
		func = function(str,obj){
			for(var i in obj){
				if(obj[i].time){
					//its an item
					maps.resources.json[str+i] = obj[i];
				}
				else{
					//it a type
					func(str+i+'.',obj[i]);
				}
			}
		}

		func('',json);
	},
	removeAll: function(){
		for(var i in this.resources){
			this.resources.obj.destroy();
		}
		this.resources = {};
	},
	serverIn: function(data){
		switch(data.type){
			case 'resources': //server sent the resources for the map
				this.removeAll();
				for(var i = 0; i < data.resources.length; i++){
					r = data.resources[i]
					this.resources[data.resources[i].id] = r
					//create the obj for it
				}
				break;
			case 'changed': //a resource changed
				break;
		}
	},
	update: function(){ //get the current resource from the server

	}
}
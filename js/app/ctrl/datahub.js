Data = function(val,update){
	o = new ko.observable(val);
	o.subscribe(update);

	return o;
}

dataHub = {
	player: Data(new PlayerDataFull(),function(data){
		//push to page.player.data
		ko.mapping.fromJS(data, page.player.data);
	})
}
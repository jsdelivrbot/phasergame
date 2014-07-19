//loads the settings from localStorage
settings = {
	graphics: {
		renderModes: ko.observableArray([
			{
				name: 'Auto',
				data: Phaser.AUTO
			},
			{
				name: 'Web GL',
				data: Phaser.WEBGL
			},
			{
				name: 'Canvas',
				data: Phaser.CANVAS
			}
		]),
		renderMode: ko.observable(Phaser.AUTO)
	}
}

//load the settings from localStorage
if(localStorage.settings){
	settings = ko.mapping.fromJSON(localStorage.settings)
}
else{
	settings = ko.mapping.fromJSON(ko.toJSON(settings))
}
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
	},
	keyboard: [
		{
			name: 'move up',
			key: ko.observable(Phaser.Keyboard.UP)
		},
		{
			name: 'move down',
			key: ko.observable(Phaser.Keyboard.DOWN)
		},
		{
			name: 'move right',
			key: ko.observable(Phaser.Keyboard.RIGHT)
		},
		{
			name: 'move left',
			key: ko.observable(Phaser.Keyboard.LEFT)
		}
	]
}
	
settings = ko.mapping.fromJSON(ko.toJSON(settings))

//load the settings from localStorage
if(localStorage.settings){
	settings = ko.mapping.fromJSON(localStorage.settings,settings)
}
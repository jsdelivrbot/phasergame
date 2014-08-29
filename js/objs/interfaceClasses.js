HTML = Klass({
	template: '',
	id: 0,
	class: '',
	settings: {},
	initialize: function(settings){
		this.id = Math.floor(Math.random() * 100000)
		this.settings = fn.duplicate(this.settings)
		this.settings = fn.combind(this.settings,settings)

		this.class += ' '
		this.class += this.settings.class || ''
	},
	parent: function(){

	}
})

Module = HTML.extend({
	template: 'module',
	class: 'reveal-modal',
	settings: {
		title: '',
		contents: [], //an array of any HTML class
		buttons: [] // an array of Buttons
	},
	open: function(){
		$("#"+this.id).foundation('reveal','open')
	},
	close: function(){
		$("#"+this.id).foundation('reveal','close')
	}
})

Button = HTML.extend({
	template: 'button',
	class: 'button',
	settings: {
		title: '',
		click: function(){}
	},
	click: function(){
		this.settings.click()
	}
})

Input = HTML.extend({
	template: 'input',
	class: '',
	settings: {
		title: '',
		type: 'text',
		default: '',
		change: function(){}
	},
	value: null,
	initialize: function(settings){
		this.supr(settings)

		this.value = ko.observable(this.settings.default)
		this.value.subscribe(this.settings.change)
	}
})
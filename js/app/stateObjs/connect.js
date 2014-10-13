connect = {
	enter: function(){
		$("#connect-module").foundation('reveal', 'open')

		page.connect.refresh();

		//tell the server to disconnect, just in case it has not
	},
	exit: function(){
		//hide module
		$("#connect-module").foundation('reveal', 'close')
	}
}
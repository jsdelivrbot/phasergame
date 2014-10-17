connect = {
	enter: function(){
		$("#connect-modal").foundation('reveal', 'open')

		page.connect.refresh();

		//tell the server to disconnect, just in case it has not
	},
	exit: function(){
		//hide modal
		$("#connect-modal").foundation('reveal', 'close')
	}
}
var login = ( baseUrl, username, password ) => {
	return nightmare => {
		return nightmare
			.goto( 'https://' + baseUrl + '/admin/' )
			.insert( '#auth_login_email', username )
			.insert( '#auth_login_password', password )
			.click( '#form_auth_login .btn.primary' )
			.wait(500)
			.end();
	}
};

var getFile = ( fileUrl ) => {
	return nightmare => {
		return nightmare
			.goto( fileUrl )
			.wait()
			.evaluate( () => document.querySelector('textarea[name="theme_template[content]"]').value );
	}
}

module.exports = {
	"login": login,
	"getFile": getFile
};
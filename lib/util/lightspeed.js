var login = ( baseUrl, username, password ) => {
	return nightmare => {
		return nightmare
			.goto( 'https://' + baseUrl + '/admin/' )
			.insert( '#auth_login_email', username )
			.insert( '#auth_login_password', password )
			.click( '#form_auth_login .btn.primary' )
			.wait('#content');
	}
};

var getFile = ( fileUrl ) => {
	return nightmare => {
		return nightmare
			.goto( fileUrl )
			.evaluate( () => {
				let $content = document.querySelector('textarea[name="theme_template[content]"], textarea[name="theme_asset[content]');

				if ( $content ) {
					return $content.value;
				} else {
					return '';
				}
			} );
	}
};


module.exports = {
	"login": login,
	"getFile": getFile
};
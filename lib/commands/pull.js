var yesno = require('yesno');
var lightspeed = require('../util/lightspeed');
var Nightmare = require('nightmare');
var fs = require('fs-extra');
var path = require('path');


var pull = function( config, mode ) {
	config.shop[ mode ].forEach( async shopBaseUrl => {
		var nightmare = new Nightmare({ show: false });

		let files = await nightmare
			.use( lightspeed.login( shopBaseUrl, config.auth.username, config.auth.password ) )
			.goto( 'https://' + shopBaseUrl + '/admin/themes' )
			.click('.theme-overview .actions a:first-child')
			.wait(500)
			.evaluate( () => Array.from( document.querySelectorAll('.editor-sidebar .body ul li a') ).map( a => a.href ) );

		for ( let i = 0, l = files.length; i < l; i++ ) {
			let fileUrl = files[i];
			let filePath = fileUrl.substring( fileUrl.indexOf( '?key=' ) + '?key='.length, fileUrl.length );
			let fileType = filePath.split( '/' )[ 0 ];

			let fileContent = await nightmare
				.use( lightspeed.getFile( fileUrl ) );

			console.log( 'data', fileContent );

			await fs.outputFile( path.join( process.cwd(), config.paths[ fileType ] + '/' + filePath.split( '/' )[ 1 ] ), fileContent );
		}

		await nightmare.end();
	} );

};


module.exports = function( args, options ) {
	var config = require('../util/config').get();

	if ( args.length === 0 ) {
		console.log("\nMissing parameter mode(test, production).\n");
		process.exit(0);
	}

	var mode = args[0];

	if ( mode === 'production' ) {
		yesno.ask('Are you sure you want to pull from production?', true, function( ok ) {

			if( ok ) {
				pull( config, mode );
			}

			process.exit(0);
		});

	} else if ( mode === 'test' ) {
		pull( config, mode );
	}
};
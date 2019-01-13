const yesno = require('yesno');
const lightspeed = require('../util/lightspeed');
const Nightmare = require('nightmare');
const fs = require('fs-extra');
const path = require('path');



let pull = async function( config, mode ) {
	let shopBaseUrl = config.shop[ mode ],
		nightmare = new Nightmare({ show: false });

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

		console.log(`Fetching file ${filePath}`);
		let fileContent = await nightmare
			.use( lightspeed.getFile( fileUrl ) );

		await fs.outputFile( path.join( process.cwd(), config.paths[ fileType ] + '/' + filePath.split( '/' )[ 1 ] ), fileContent );
	}

	await nightmare.end();
};


module.exports = function( args, options ) {
	let config = require('../util/config').get();

	if ( args.length === 0 ) {
		console.log("\nMissing parameter mode(test, production).\n");
		process.exit(0);
	}

	let mode = args[0];

	if ( mode === 'production' ) {
		yesno.ask('Are you sure you want to pull from production?', true, function( ok ) {
			if( ok ) {
				pull( config, mode );

			} else {
				process.exit( 0 );
			}
		});

	} else if ( mode === 'test' ) {
		pull( config, mode );
	}
};
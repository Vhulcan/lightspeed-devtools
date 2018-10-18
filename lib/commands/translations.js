var yesno = require('yesno');
var lightspeed = require('../util/lightspeed');
var Nightmare = require('nightmare');
var fs = require('fs-extra');
var path = require('path');


var pull = function( config, mode ) {
	config.shop[ mode ].forEach( async shopBaseUrl => {
		var nightmare = new Nightmare({ show: true })
			.use( lightspeed.login( shopBaseUrl, config.auth.username, config.auth.password ) );
		var translations = [];

		// TODO: refactor code below so this can also be used for push command

		var pagesCount = await nightmare
			.goto( 'https://' + shopBaseUrl + '/admin/custom_translations' )
			.evaluate( () => document.querySelectorAll('.js-pag-custom_translations .button').length || 1 );

		for ( let page = 1; page <= pagesCount; page++ ) {
			var translationLinks = await nightmare
				.goto( 'https://' + shopBaseUrl + '/admin/custom_translations?page=' + page )
				.evaluate( () => Array.from( document.querySelectorAll('#table_custom_translations a.btn[href*="/admin/custom_translations/"]') ).map( btn => btn.getAttribute('href') ) );

			var first = true;
			for ( var translationLink of translationLinks ) {
				if ( ! first ) {
					await nightmare
						.click('#modal .btn.close')
						.wait(400);
				}

				var translation = await nightmare
					.click('a[href="'+ translationLink +'"]')
					.wait('#modal-content')
					.evaluate( () => {
						var formData = new FormData( document.querySelector('#modal form') );
						var translation = {};

						for ( var pair of formData.entries() ) {
							var key = pair[0];
							var value = pair[1];
							var match = /\[(\w+)\]/.exec( key );

							if ( match ) {
								translation[ match[1] ] = value;
							}
						}

						return translation;
					} );

				translations.push( translation );
				first = false;
			}
		}

		if ( translations.length === 0 ) {
			return;
		}

		// We should now have all our translations
		var languages = Object.keys( translations[0] ).filter( key => key !== 'key' );

		for ( var language of languages ) {
			var fileName = language + '.json';
			var fileContent = {};

			for ( var translation of translations ) {
				fileContent[ translation['key'] ] = translation[ language ];
			}

			await fs.outputFile( path.join( process.cwd(), config.paths.localization, fileName ), JSON.stringify( fileContent, null, 2 ) );
		}

		await nightmare.end();
	} );

};

var push = function( config, mode ) {

	config.shop[ mode ].forEach( async shopBaseUrl => {
		var nightmare = new Nightmare({ show: true })
			.use( lightspeed.login( shopBaseUrl, config.auth.username, config.auth.password ) );
		var existingTranslations = [];

		// Get our existing translations on lightspeed so we can differentiate between new and existing ones

		var pagesCount = await nightmare
			.goto( 'https://' + shopBaseUrl + '/admin/custom_translations' )
			.evaluate( () => document.querySelectorAll('.js-pag-custom_translations .button').length || 1 );

		for ( let page = 1; page <= pagesCount; page++ ) {
			var translationLinks = await nightmare
				.goto( 'https://' + shopBaseUrl + '/admin/custom_translations?page=' + page )
				.evaluate( () => Array.from( document.querySelectorAll('#table_custom_translations a.btn[href*="/admin/custom_translations/"]') ).map( btn => btn.getAttribute('href') ) );

			var first = true;
			for ( var translationLink of translationLinks ) {
				if ( ! first ) {
					await nightmare
						.click('#modal .btn.close')
						.wait(400);
				}

				var translation = await nightmare
					.click('a[href="'+ translationLink +'"]')
					.wait('#modal-content')
					.evaluate( () => {
						var form = document.querySelector('#modal form'),
							formData = new FormData( form ),
							translation = {};

						for ( var pair of formData.entries() ) {
							var key = pair[0];
							var match = /\[(\w+)\]/.exec( key );

							if ( match && match[1] === 'key' ) {
								translation[ match[1] ] = form.getAttribute('action');
							}
						}

						return translation;
					} );

				existingTranslations.push( translation );
				first = false;
			}
		}

		// Map our translations
		var translations = {};

		//var rawdata = fs.readFileSync('lightspeed.json');
		//var data = JSON.parse( rawdata );


	});

};

module.exports = function( args, options ) {
	var config = require('../util/config').get();

	if ( args.length === 0 ) {
		console.log("\nMissing parameter mode(test, production).\n");
		process.exit(0);
	}

	var command = args[0];
	var mode = args[1];

	if ( mode === 'production' ) {
		if ( command === 'pull' ) {
			yesno.ask( 'Are you sure you want to pull from production?', true, function (ok) {
				if ( ok ) {
					pull( config, mode );
				}

				process.exit( 0 );
			} );

		} else if ( command === 'push' ) {
			yesno.ask( 'Are you sure you want to pull from production?', true, function (ok) {
				if ( ok ) {
					push( config, mode );
				}

				process.exit( 0 );
			} );
		}

	} else if ( mode === 'test' ) {
		if ( command === 'pull' ) {
			pull( config, mode );

		} else if ( command === 'push' ) {
			push( config, mode );
		}
	}
};
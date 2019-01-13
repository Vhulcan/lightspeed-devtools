const yesno = require('yesno');
const lightspeed = require('../util/lightspeed');
const Nightmare = require('nightmare');
const fs = require('fs-extra');
const path = require('path');


let pull = async function( config, mode ) {
	let shopBaseUrl = config.shop[ mode ];

	let nightmare = new Nightmare({ show: true })
		.use( lightspeed.login( shopBaseUrl, config.auth.username, config.auth.password ) );
	let translations = [];

	// TODO: refactor code below so this can also be used for push command

	let pagesCount = await nightmare
		.goto( 'https://' + shopBaseUrl + '/admin/custom_translations' )
		.evaluate( () => {
			let buttons = document.querySelectorAll('.js-pag-custom_translations .btn');
			// Last button is our "Last page-button"
			let lastPageButton = Array.from( buttons ).pop();
			return lastPageButton.getAttribute('data-goto') || 1;
		} );

	for ( let page = 1; page <= pagesCount; page++ ) {
		let translationLinks = await nightmare
			.goto( 'https://' + shopBaseUrl + '/admin/custom_translations?page=' + page )
			.evaluate( () => Array.from( document.querySelectorAll('#table_custom_translations a.btn[href*="/admin/custom_translations/"]') ).map( btn => btn.getAttribute('href') ) );

		let first = true;
		for ( let translationLink of translationLinks ) {
			if ( ! first ) {
				await nightmare
					.click('#modal .btn.close')
					.wait(400);
			}

			let translation = await nightmare
				.click('a[href="'+ translationLink +'"]')
				.wait('#modal-content')
				.evaluate( () => {
					let formData = new FormData( document.querySelector('#modal form') );
					let translation = {};

					for ( let pair of formData.entries() ) {
						let key = pair[0];
						let value = pair[1];
						let match = /\[(\w+)\]/.exec( key );

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
	let languages = Object.keys( translations[0] ).filter( key => key !== 'key' );

	for ( let language of languages ) {
		let fileName = language + '.json';
		let fileContent = {};

		for ( let translation of translations ) {
			fileContent[ translation['key'] ] = translation[ language ];
		}

		await fs.outputFile( path.join( process.cwd(), config.paths.localization, fileName ), JSON.stringify( fileContent, null, 2 ) );
	}

	await nightmare.end();

};

let push = async function( config, mode ) {
 	let shopBaseUrl = config.shop[ mode ];

	// Map our translations
	let translations = {};

	fs.readdir( path.join( process.cwd(), config.paths.localization ), (err, items) => {
		items.forEach( filePath => {
			let language = filePath.replace('.json', '');
			let language_translations = fs.readJsonSync( path.join( process.cwd(), config.paths.localization, filePath ) );

			console.log('language', language );

			for ( let key in Object.keys( language_translations ) ) {
				if ( key in translations ) {
					translations[key][language] = language_translations[ key ];
				} else {
					translations[key] = {};
					translations[key][language] = language_translations[ key ];
				}
				console.log( language_translations[ key ] );
			}
		} );
	} );

	console.log( translations );

	//let data = fs.readFileSync('lightspeed.json');

	//let rawdata = fs.readFileSync('lightspeed.json');
	//let data = JSON.parse( rawdata );


		/*let nightmare = new Nightmare({ show: true })
			.use( lightspeed.login( shopBaseUrl, config.auth.username, config.auth.password ) );
		let existingTranslations = [];

		// Get our existing translations on lightspeed so we can differentiate between new and existing ones

		let pagesCount = await nightmare
			.goto( 'https://' + shopBaseUrl + '/admin/custom_translations' )
			.evaluate( () => document.querySelectorAll('.js-pag-custom_translations .button').length || 1 );

		for ( let page = 1; page <= pagesCount; page++ ) {
			let translationLinks = await nightmare
				.goto( 'https://' + shopBaseUrl + '/admin/custom_translations?page=' + page )
				.evaluate( () => Array.from( document.querySelectorAll('#table_custom_translations a.btn[href*="/admin/custom_translations/"]') ).map( btn => btn.getAttribute('href') ) );

			let first = true;
			for ( let translationLink of translationLinks ) {
				if ( ! first ) {
					await nightmare
						.click('#modal .btn.close')
						.wait(400);
				}

				let translation = await nightmare
					.click('a[href="'+ translationLink +'"]')
					.wait('#modal-content')
					.evaluate( () => {
						let form = document.querySelector('#modal form'),
							formData = new FormData( form ),
							translation = {};

						for ( let pair of formData.entries() ) {
							let key = pair[0];
							let match = /\[(\w+)\]/.exec( key );

							if ( match && match[1] === 'key' ) {
								translation[ match[1] ] = form.getAttribute('action');
							}
						}

						return translation;
					} );

				existingTranslations.push( translation );
				first = false;
			}
		}*/

};

module.exports = function( args, options ) {
	let config = require('../util/config').get();

	if ( args.length === 0 ) {
		console.log("\nMissing parameter mode(test, production).\n");
		process.exit(0);
	}

	let command = args[0];
	let mode = args[1];

	if ( mode === 'production' ) {
		if ( command === 'pull' ) {
			yesno.ask( 'Are you sure you want to pull from production?', true, function (ok) {
				if ( ok ) {
					pull( config, mode );

				} else {
					process.exit( 0 );
				}
			} );

		} else if ( command === 'push' ) {
			yesno.ask( 'Are you sure you want to pull from production?', true, function (ok) {
				if ( ok ) {
					push( config, mode );

				} else {
					process.exit( 0 );
				}
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
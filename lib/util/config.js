var fs = require('fs');
var path = require('path');


var getConfig = function( checkIfValid = true ) {
	// Check if the user is inside a project folder, by looking for a lightspeed.json file
	if (!fs.existsSync(path.join(process.cwd(), 'lightspeed.json'))) {
		console.log("\nYou don't appear to have a Lightspeed configuration.");
		process.exit(0);
	}

	var rawdata = fs.readFileSync('lightspeed.json');
	var data = JSON.parse( rawdata );

	if ( checkIfValid ) {
		if (data.shop.production.length === 0 && data.shop.test.length === 0) {
			console.log("\nYou don't have a test or production shop configured in your lightspeed.json file. You need at least 1.\n");
			process.exit(0);
		}
	}

	return data;
};

var initConfig = function() {
	// Check if the user is inside a project folder, by looking for a lightspeed.json file
	if (fs.existsSync(path.join(process.cwd(), 'lightspeed.json'))) {
		console.log("\nYou appear to have an existing Lightspeed configuration.\n");
		process.exit(0);
	}

	// Our default config
	var defaults = {
		"shop": {
			"production": ".webshopapp.com",
			"test": ".webshopapp.com"
		},
		"paths": {
			"layouts": "./templates/layouts",
			"pages": "./templates/pages",
			"snippets": "./templates/snippets",
			"assets": "./dist",
			"localization": "./localization/"
		},
		"auth": {
			"username": "your@email.com",
			"password": "***"
		}
	};

	let data = JSON.stringify( defaults, null, 2 );
	fs.writeFileSync(path.join(process.cwd(), 'lightspeed.json'), data);

	return data;
};

module.exports = {
	"get": getConfig,
	"init": initConfig
};
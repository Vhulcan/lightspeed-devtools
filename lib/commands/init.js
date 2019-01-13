const fs = require('fs');
const path = require('path');

module.exports = function (args, options) {
	// Check if the user is inside a project folder, by looking for a lightspeed.json file
	if (fs.existsSync(path.join(process.cwd(), 'lightspeed.json'))) {
		console.log("\nYou appear to have an existing Lightspeed configuration.\n");
		process.exit(0);
	}

	// Our default config
	let defaults = {
		"shop": {
			"production": "xxx.webshopapp.com",
			"test": "xxx.webshopapp.com"
		},
		"paths": {
			"layouts": "./views/layouts",
			"pages": "./views/pages",
			"snippets": "./views/snippets",
			"assets": "./dist"
		},
		"auth": {
			"username": "your@email.com",
			"password": "***"
		},
		"contexts": {
			"index": {},
			"product": {},
			"collection": {},
			"catalog": {},
			"search": {},
			"brands": {},
			"textpage": {},
			"tags": {},
			"blog": {},
			"article": {},
			"cart": {},
			"checkout/default": {},
			"checkout/default/details": {},
			"checkout/default/shipping": {},
			"checkout/default/shipment": {},
			"checkout/default/payment": {},
			"checkout/default/review": {},
			"thankyou": {}
		}
	};

	let data = JSON.stringify( defaults, null, 2 );

	fs.writeFileSync(path.join(process.cwd(), 'lightspeed.json'), data);

	return data;
};
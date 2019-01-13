const fs = require('fs');
const path = require('path');

let getConfig = function( checkIfValid = true ) {
	// Check if the user is inside a project folder, by looking for a lightspeed.json file
	if (!fs.existsSync(path.join(process.cwd(), 'lightspeed.json'))) {
		console.log("\nYou don't appear to have a Lightspeed configuration.");
		process.exit(0);
	}

	let rawdata = fs.readFileSync('lightspeed.json');
	let data = JSON.parse( rawdata );

	if ( checkIfValid ) {
		if (data.shop.production.length === 0 && data.shop.test.length === 0) {
			console.log("\nYou don't have a test or production shop configured in your lightspeed.json file. You need at least 1.\n");
			process.exit(0);
		}
	}

	return data;
};

module.exports = {
	"get": getConfig
};
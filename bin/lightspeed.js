#!/usr/bin/env node

var nopt = require('nopt');
var pkg = require('../package');
var lightspeed = require('../lib');

// Options that can be passed to commands
var options = {
	"templates": String,
	"are-you-sure": Boolean
};

// Shorthands for the commands above
var shorthands = {
	"v": "--version",
	"y": "--are-you-sure"
};

var parsed = nopt(options, shorthands);

// cmd.args contains basic commands like "init" and "help"
// cmd.opts contains options, like --libsass and --version
var cmd = {
	args: parsed.argv.remain,
	opts: parsed
};

// No other arguments given
if (typeof cmd.args[0] === 'undefined') {
	// If -v or --version was passed, show the version
	if (typeof cmd.opts.version !== 'undefined') {
		process.stdout.write( pkg.name + " version " + pkg.version + '\n');
	}
	// Otherwise, just show the help screen
	else {
		lightspeed.help();
	}

} else { // Arguments given
	// If the command typed in doesn't exist, show the help screen
	if (typeof lightspeed[cmd.args[0]] == 'undefined') {
		lightspeed.help();
	}
	// Otherwise, just run it already!
	else {
		// Every command function is passed secondary commands, and options
		// So if the user types "foundation new myApp --edge", "myApp" is a secondary command, and "--edge" is an option
		lightspeed[cmd.args[0]](cmd.args.slice(1), cmd.opts);
	}
}
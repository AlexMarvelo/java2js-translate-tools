const yargs = require('yargs');
const compileProps2Json = require('./compile');


const argv = yargs.command(
	'compile',
	'compile JSON-formatted translation files', {
		// Options
		src: {
			alias: 's',
		},
	}, (args) => {
		// Handler
		return compileProps2Json(args);
	}
).help().argv;

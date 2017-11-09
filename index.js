/* eslint no-unused-expressions:0 */
const yargs = require('yargs');
const compileProps2Json = require('./compile');


yargs.command(
	'compile',
	'compile JSON-formatted translation files', {
		// Options
		src: {
			alias: 's',
		},
		dist: {
			alias: 'd',
		},
		default: {
			alias: 'f',
			default: 'en',
		},
	}, (args) => {
		// Handler
		try {
			compileProps2Json(args);
		} catch (error) {
			console.error(error);
		}
	}
)
	.help()
	.argv;

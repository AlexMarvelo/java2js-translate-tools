/* eslint no-unused-expressions:0 */
const yargs = require('yargs');
const compileProps2Json = require('./compile');


yargs.command(
	'compile',
	'compile JSON-formatted translation files', {
		// Options
		src: {
			alias: 's',
			describe: 'puth to a folder with locales directories',
		},
		dist: {
			alias: 'd',
			describe: 'path to a folder where compiled files will be placed',
		},
		default: {
			alias: 'f',
			default: 'en',
			describe: 'default locale (must match one of locales folder name)',
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
	.demandOption(['src', 'dist'], 'Please provide both src and dist arguments')
	.help()
	.argv;

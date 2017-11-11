const fs = require('fs');
const path = require('path');


const checkRelativePath = (argv, options = []) => {
	const cwd = process.cwd();
	options.forEach((option) => {
		if (argv[option][0] === '.') {
			// relative path
			argv[option] = path.join(cwd, argv[option]);
		}
	});
	return argv;
};


const checkFolderExists = pathStr =>
	fs.existsSync(pathStr) && fs.statSync(pathStr).isDirectory();


module.exports = {
	checkRelativePath,
	checkFolderExists,
};

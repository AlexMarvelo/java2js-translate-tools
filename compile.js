const { read } = require('properties-parser');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const merge = require('lodash/merge');
const debug = require('debug')('app:scripts:i18n2Json');


const javaStringToLocaleMessageFormat = (string) => {
	let counter = -1;
	return string.replace(/%([a-z])/g, ((match, p1) => {
		counter += 1;
		return `%{${p1}${counter}}`;
	}));
};

const stringWithDotsProcess = ({
	initialObj, initialKey, value, keysLeft, objLink,
}) => {
	const curKey = keysLeft.shift();
	if (!keysLeft.length) {
		delete initialObj[initialKey];
		objLink[curKey] = value;
		return;
	}
	objLink[curKey] = objLink[curKey] || {};
	stringWithDotsProcess({
		initialObj, initialKey, value, keysLeft, objLink: objLink[curKey],
	});
};

const parseAccessibleLocales = (src) => {
	const ignoreList = ['.DS_Store'];
	const locales = [];
	fs.readdirSync(src).forEach((itemName) => {
		if (ignoreList.indexOf(itemName) === -1) {
			if (fs.statSync(`${src}/${itemName}`).isDirectory()) {
				locales.push(itemName);
			}
		}
	});
	return locales;
};

const dots2keys = (obj) => {
	Object.keys(obj).forEach((key) => {
		if (key.indexOf('.') === -1) {
			return;
		}

		const value = javaStringToLocaleMessageFormat(obj[key]);
		stringWithDotsProcess({
			initialObj: obj, initialKey: key, value, keysLeft: key.split('.'), objLink: obj,
		});
	});
};

const parseLanguagesFromDir = ({ localeName, langDir }) => {
	const allLocalesObject = {};
	glob
		.sync('*.properties', { cwd: path.join(langDir, localeName), realpath: true })
		.forEach((propertiesFilename) => {
			const namespace = /([^/]+).properties$/.exec(propertiesFilename)[1]; // extract filename without extention
			const objectOfLocalisedMessages = read(propertiesFilename);
			dots2keys(objectOfLocalisedMessages);
			allLocalesObject[namespace] = objectOfLocalisedMessages;
		});
	return allLocalesObject;
};

const props2Json = (argv) => {
	const {
		src: langDir,
		dist: destinationDir,
		default: defaultLocale,
	} = argv;
	debug('Start parsing locales props files to Json');
	const locales = parseAccessibleLocales(langDir);
	if (!locales.length) return;

	// Delete old .json files
	glob
		.sync('*', { cwd: destinationDir })
		.forEach((localeName) => {
			fs.unlinkSync(path.join(destinationDir, localeName));
		});


	fs.writeFileSync(path.join(destinationDir, 'accessibleLocales.json'), JSON.stringify(locales, null, 4), 'utf-8');

	const defaultLocalesObj = parseLanguagesFromDir({ localeName: defaultLocale, langDir });


	// Genereated needed locales
	locales.forEach((localeName) => {
		debug(`Start parsing locale: ${localeName}`);
		const localesObject = parseLanguagesFromDir({ localeName, langDir });
		const localeObjectWithDefaultsApplied = merge({}, defaultLocalesObj, localesObject);
		const destFile = path.join(destinationDir, `${localeName}.json`);
		fs.writeFileSync(destFile, JSON.stringify(localeObjectWithDefaultsApplied, null, 4), 'utf-8');
		debug(`File was successfully written: ${destFile}`);
	});

	debug('All the localisation files prepared. OK.');
};

module.exports = props2Json;

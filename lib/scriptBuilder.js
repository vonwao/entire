/**
 * Module dependencies
 **/

var fs = require("co-fs");
var path = require("path");

/**
 * Create a scripts.js for a set of features
 *
 * @params: {KVP} features
 * @return: {String} scripts.js
 * @api: public
 */

module.exports = function *(features) {
	//load the basic script that allows for node_module like require
	var allModules = yield fs.readFile(path.join(__dirname, "baseScripts.js"));

	//add the scripts of all features
	for (var i = 0; i < features.length; i++) {
		if (features[i].scripts) {
			var filePath = path.join(features[i].base, features[i].scripts);
			var module = yield fs.readFile(filePath, "utf8");
			module = exportsReplace(features[i].name, module);
			module = iffeify(module);
			allModules += module;
		}
	}

	if(process.env.DEBUG){
		return allModules;
	}
	else{
		return iffeify(allModules);
	}
}

/**
 * Replace module.exports with a reference to require.module
 *
 * @api: private
 */

function exportsReplace(name, module) {
	var exportName = "require.module['" + name + "']";
	module = module.replace(/module\.exports/g, exportName);
	return module;
}

/**
 * Wrap this all in an iffe
 *
 * @api: private
 */

function iffeify(module) {
	return "(function(){\n" + module + "})();\n\n";
}
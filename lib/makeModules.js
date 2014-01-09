var fs = require("fs");
var path = require("path");
var debug = require("debug")("entire");
var view = require("entire-render");
var sortModules = require("./sortModules")

/**
 * KVP all the modules with thier package.json and add a path called base
 *
 * @api: public
 * @params: {String} folder
 * @return: {Object} modules
 * @modules: {String} key, {Module} value
 * @module: {String} base, ...
 */

module.exports = function(folder) {
	debug("LOOKING FOR ENTIRE_MODULES IN "+folder);
	var files = fs.readdirSync(folder);

	var modules = {};

	for (var i = 0; i < files.length; i++) {
		var moduleFolder = path.join(folder, files[i]);
		var stat = fs.statSync(moduleFolder);
		if (stat.isDirectory()) {
			var moduleData = require(path.join(folder, files[i], "package.json"));

			if(moduleData["entire"]){
				debug("REGISTERING: "+moduleFolder);
				var data  = moduleData["entire"];
				data.name = data.name || moduleData.name;
				data.base = path.join(folder, files[i]);
				view.add(files[i], path.join(data.base, "views"));
				modules[moduleData.name] = data;
			}

		}
	}

	return sortModules(modules);
}
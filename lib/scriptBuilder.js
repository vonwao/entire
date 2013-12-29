var fs = require("co-fs");
var path = require("path");

module.exports = function * (features) {
	var allModules = yield fs.readFile(path.join(__dirname, "baseScripts.js"));
	for (var i = 0; i < features.length; i++) {
		if (features[i].scripts) {
			var filePath = path.join(features[i].base, features[i].scripts);
			var module = yield fs.readFile(filePath, "utf8");
			module = exportsReplace(features[i].name, module);
			module = iffeify(module, true);
			allModules += module;
		}
	}
	return allModules; //iffeify(allModules, false);
}

function exportsReplace(name, module) {
	var exportName = "require.module['" + name + "']";
	module = module.replace(/module\.exports/g, exportName);
	return module;
}

function iffeify(module, passRequire) {
	return "(function(){\n" + module + "})(" + (passRequire ? "require" : "") + ");\n\n";
}
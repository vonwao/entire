var fs = require("co-fs");
var path = require("path");

module.exports = function * (features) {
	var out = "";
	for (var i = 0; i < features.length; i++) {
		if (features[i].scripts) {
			var gen = iffeify(path.join(features[i].base, features[i].scripts));
			var iffe = yield gen;
			out += iffe + "\n";
		}
	}
	return out;
}

function iffeify(path) {
	return function * () {

		var file = yield fs.readFile(path, "utf8");
		return "(function(){" + file + "})()";
	}
}
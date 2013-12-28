var fs = require("co-fs");
var path = require("path");
var debug = require("debug")("featurlets");

module.exports = function * (features) {
	var out = "";
	for (var i = 0; i < features.length; i++) {

		var feature = features[i];

		if (feature.styles) {
			var filePath = path.join(feature.base, feature.styles);
			try {
				var css = yield fs.readFile(filePath, 'utf8');
			}
			catch (err) {
				debug("Failed to open style file for " + feature.name);
				throw err;
			}
			out += css;
		}
	}
	return out;
}
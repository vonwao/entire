var fs = require("fs");
var path = require("path");
var debug = require("debug")("featurlets");

module.exports = function(folder) {
	var files = fs.readdirSync(folder);

	var features = {};

	for (var i = 0; i < files.length; i++) {
		var stat = fs.statSync(path.join(folder, files[i]));
		if (stat.isDirectory()) {
			var featureData = require(path.join(folder, files[i], "feature.json"));

			featureData.base = path.join(folder, files[i]);

			features[featureData.name] = featureData;

		}
	}

	return features;
}
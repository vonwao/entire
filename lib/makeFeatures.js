module.exports = function(folder) {
	var files = fs.readdirSync(folder);

	var features = {};

	for (var i = 0; i < files.length; i++) {
		var stat = fs.statSync(path.join(folder, files[i]));
		if (stat.isDirectory()) {
			var featureData = require(path.join(folder, files[i], "feature.json"));

			if (featureData["routes"] !== undefined) {
				var routes = require(path.join(folder, files[i], featureData["routes"]));

				var

			}

			features[featureData.name] = featureData;

		}
	}

	return features;
}
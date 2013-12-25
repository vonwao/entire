module.exports = function(pfsp, features) {

	var cache = {};

	return function(permission) {
		if (pfsp === true) {
			permission = "all";
			if (pfsp["all"] == undefined) {
				pfsp["all"] = Object.keys(features);
			}
		}

		if (pfsp[permission] !== undefined) {
			if (cache[permission] == undefined) {
				var list = pfsp[permission];

				var result = [];

				for (var i = 0; i < list.length; i++) {
					var feature = features[list[i]];
					if (feature) {
						result.push(feature);
						feature.dependencies = feature.dependencies || [];
						for (var j = 0; j < feature.dependencies.length; j++) {
							if (list.indexOf(feature.dependencies[j]) == -1) {
								list.push(feature.dependencies[j]);
							}
						}
					}
					else {
						throw new Error("Invalid feature in permission or dependencies set: " + list[i]);
					}
				}

				cache[permission] = result;
			}

			return cache[permission];
		}
		else {
			throw new Error("Invalid Permission Type");
		}
	}
}
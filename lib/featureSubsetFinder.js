var debug = require("debug")("featurlets");

module.exports = function(pfsp, features) {

	var cache = {};

	var ifAll = function(permission) {
		if (pfsp === true) {
			permission = "all";
			if (pfsp["all"] == undefined) {
				pfsp["all"] = Object.keys(features);
			}
		}
		return permission;
	}

	var isValidPermission = function(permission) {
		if (pfsp[permission] !== undefined) {
			return true;
		}
		else {
			throw new Error("Invalid Permission Type");
		}
	}

	var fn = function(permission) {
		permission = ifAll(permission);

		if (isValidPermission(permission)) {
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
	}

	var cacheNames = {};
	fn.names = function(permission) {
		permission = ifAll(permission);

		if (isValidPermission(permission)) {
			if (cacheNames[permission] == undefined) {
				var list = fn(permission);

				var names = [];

				for (var i = 0; i < list.length; i++) {
					names.push(list[i].name);
				}

				cacheNames[permission] = names;
			}
		}

		return cacheNames[permission];
	}

	return fn;
}
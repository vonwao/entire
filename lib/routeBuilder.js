var compose = require("koa-compose");
var route = require("koa-route");
var methods = require("methods");
var path = require("path");
var debug = require("debug")("featurlets");

module.exports = function(features, getFeatureSubset) {

	var routes = [];

	var featureNames = Object.keys(features);

	for (var i = 0; i < featureNames.length; i++) {
		var featureName = featureNames[i];
		var feature = features[featureName];

		var router = ROUTER(featureName, getFeatureSubset);

		if (feature.router) {
			var routerModule = require(path.join(feature.base, feature.router));
			routerModule(router);
			routes = routes.concat(router.getRouteArray());
		}
	}

	var out = compose(routes);

	return out;

}

function ROUTER(feature, getFeatureSubset) {

	var fr = [];

	function create(method) {
		return function(path, fn) {
			fr.push(route[method](path, function * routeAuthCheck(next) {
				debug(">>>", path);
				var subset = getFeatureSubset.names(this.permission);

				if (subset.indexOf(feature) == -1) {
					this.status = 401;
					if (next) {
						yield next;
					}
				}
				else {
					debug(">>> fn");
					fn.apply(this, arguments);
					debug("<<< fn");
					if (next) {
						yield next;
					}
				}
				debug("<<<", path);
			}));
		}
	}

	var R = {};

	for (var i = 0; i < methods.length; i++) {
		R[methods[i]] = create(methods[i]);
	}

	R.all = create("all");

	R.del = R["delete"];

	R.getRouteArray = function() {
		return fr;
	}

	return R;
}
var fs = require("fs");
var path = require("path");
var featureSubsetFinder = require("./lib/featureSubsetFinder");
var makeFeatures = require("./lib/makeFeatures");
var styleBuilder = require("./lib/styleBuilder");
var scriptBuilder = require("./lib/scriptBuilder");

var options = {};

var FEATURLETS = module.exports = function(opts) {

	if (!opts.folder) {
		throw new Error("FOLDER MUST BE DEFINED");
	}
	else {
		console.log("FEATURE FOLDER", opts.folder);
	}

	opts.styles = opts.styles || /styles\.css$/;
	opts.scripts = opts.scripts || /scripts\.js$/;

	if (opts.styles instanceof RegExp !== true) {
		throw new Error("opts.styles must be a RegExp");
	}

	if (opts.scripts instanceof RegExp !== true) {
		throw new Error("opts.styles must be a RegExp");
	}

	opts.permissions = opts.permissions || true;

	var features = makeFeatures(opts.folder);
	var getFeatureSubset = featureSubsetFinder(opts.permissions, features);

	var middleware = {};

	middleware.styleist = function * (next) {
		if (opts.styles.test(this.path)) {
			if (styles[this.permission] == undefined) {
				var subset = getFeatureSubset(this.permission);
				styles[this.permission] = styleBuilder(subset);
			}

			this.type = "text/css";
			this.body = styles[this.permission];
		}
		else {
			yield next;
		}
	}

	middleware.scriptor = function * (next) {
		if (opts.scripts.test(this.path)) {
			if (scripts[this.permission] == undefined) {
				var subset = getFeatureSubset(this.permission);
				scripts[this.permission] = scriptBuilder(subset);
			}

			this.type = "application/javascript";
			this.body = scripts[this.permission];
		}
		else {
			yield next;
		}
	}

	middleware.router = function * (next) {
		var subset = getFeatureSubset(this.permission);

		var foundRoute = router.call(this, subset);

		if (!foundRoute) {
			yield next;
		}
	}
}
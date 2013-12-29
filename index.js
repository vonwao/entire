var fs = require("fs");
var path = require("path");
var featureSubsetFinder = require("./lib/featureSubsetFinder");
var makeFeatures = require("./lib/makeFeatures");
var styleBuilder = require("./lib/styleBuilder");
var scriptBuilder = require("./lib/scriptBuilder");
var routeBuilder = require("./lib/routeBuilder");
var debug = require("debug")("featurlets");
var reqMore = require("require-more")();

var FEATURLETS = module.exports = function(opts) {

	if (!opts.folder) {
		throw new Error("FOLDER MUST BE DEFINED");
	}
	else {
		debug("FEATURE FOLDER", opts.folder);
	}

	reqMore(opts.folder);

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
	var router = routeBuilder(features, getFeatureSubset);

	var middleware = {};

	var styles = {};
	middleware.styleist = function * (next) {
		debug(">>> STYLEIST");
		if (opts.styles.test(this.path)) {
			if (styles[this.permission] == undefined) {
				debug(">>> BUILDING STYLE: " + this.permission);
				var subset = getFeatureSubset(this.permission);
				styles[this.permission] = yield styleBuilder(subset);
				debug("<<< BUILDING STYLE: " + this.permission);
			}

			this.type = "text/css";
			this.body = styles[this.permission];
		}
		else {
			yield next || noop;
		}
		debug("<<< STYLEIST");
	}

	var scripts = {};
	middleware.scriptor = function * (next) {
		debug(">>> SCRIPTOR");
		if (opts.scripts.test(this.path)) {
			if (scripts[this.permission] == undefined) {
				debug(">>> BUILDING SCRIPT: " + this.permission);
				var subset = getFeatureSubset(this.permission);
				scripts[this.permission] = yield scriptBuilder(subset);
				debug("<<< BUILDING SCRIPT: " + this.permission);
			}

			this.type = "application/javascript";
			this.body = scripts[this.permission];
		}
		else {
			yield next || noop;
		}
		debug("<<< SCRIPTOR");
	}

	middleware.router = function * (next) {
		debug(">>> ROUTER");
		yield router.call(this, next || noop);
		debug("<<< ROUTER");
	}

	middleware.all = function * (next) {
		yield middleware.styleist.call(this, middleware.scriptor.call(this, middleware.router.call(this, next || noop)));
	}

	function noop() {};

	return middleware;
}
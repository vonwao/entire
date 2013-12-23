var fs = require("fs");
var path = require("path");

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

	var features = {};

	fs.readdir(opts.folder, function(err, files) {
		if (err) {
			throw err;
		}
		else {
			for (var i = 0; i < files.length; i++) {
				var stat = fs.statSync(path.join(opts.folder, files[i]));
				if (stat.isDirectory()) {
					var featureData = require(path.join(opts.folder, files[i], "feature.json"));
					features[featureData.name] = featureData;
				}
			}
		}
	});

	return function * (next) {
		if (opts.styles.test(this.path)) {
			return style.apply(this, arguments);
		}
		else if (opts.scripts.test(this.path)) {
			console.log("IN HERE");
			return scripts.apply(this, arguments);
		}
		else {
			return routes.apply(this, arguments);
		}
	}
}

var style = function * () {
	this.body = "style";
}

var scripts = function * () {
	console.log("AND HERE");
	this.body = "scripts";
}

var routes = function * () {
	this.body = "routes";
}
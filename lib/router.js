var methods = require("methods");
var pathToRegEx = require("path-to-regexp");


var ways = {};

var create = function(method) {
	if (method) method = method.toUpperCase();

	return function(path, fn) {
		var re = pathToRegexp(path);
		app.use(function * (next) {

			if (doesNotHaveAccess(this)) {
				return yield next;
			}

			if (method && method != this.method) {
				return yield next;
			}

			var m;
			if (m = re.exec(this.path)) {
				var args = m.slice(1);
				yield fn.apply(this, args);
				return;
			}

			yield next;

		});
	}
}

var R = {};

for (var i = 0; i < methods.length; i++) {
	R[methods[i]] = create(methods[i]);
}

R["all"] = create();

R["del"] = R["delete"];

R.router = function(path)

module.exports = R;
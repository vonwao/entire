/**
 * Module dependencies
 */

var compose = require("koa-compose");
var route = require("koa-route");
var methods = require("methods");
var path = require("path");
var debug = require("debug")("entire");

/**
 * Compose all module routes
 *
 * @params: {KVP} modules, {Function} getModuleSubset
 * @return: {GeneratorFunction} router
 * @api: public
 */

module.exports = function(modules, getModuleSubset) {

	var routes = [];

	var moduleNames = Object.keys(modules);

	for (var i = 0; i < moduleNames.length; i++) {
		var moduleName = moduleNames[i];
		var module = modules[moduleName];

		var router = ROUTER(moduleName, getModuleSubset);

		if (module.router) {
			var routerModule = require(path.join(module.base, module.router));
			routerModule(router);
			routes = routes.concat(router.getRouteArray());
		}
	}

	var out = compose(routes);

	return out;

}

/**
 * Build Router for a module
 *
 * @params: {String} moduleName, {Function} getModuleSubset
 * @return: {Object} Router
 * @api: private
 */

/**
 * Note: this is koa-route rewrapped to work like express.get...post...etc
 *       goal is that we can give this to a users module and they can do
 *       something like app.get("/", function *(){ this.body = "welcome"});
 *		 and not have to worry about getting middleware back to koa
 */
 
function ROUTER(moduleName, getModuleSubset) {

	var fr = [];

	function create(method) {
		return function(path, fn) {
			fr.push(route[method](path, function * routeAuthCheck(next) {
				debug(">>>", path);
				var subset = getModuleSubset.names(this.permission);

				//return 401 if this module is not in the permission set
				if (subset.indexOf(moduleName) == -1) {
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
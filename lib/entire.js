/**
 * Module dependencies.
 */

var fs = require("fs");
var path = require("path");
var send = require("koa-send");
var compose = require("koa-compose");
var moduleSubsetFinder = require("./moduleSubsetFinder");
var makeModules = require("./makeModules");
var styleBuilder = require("./styleBuilder");
var scriptBuilder = require("./scriptBuilder");
var backend = require("./backend");
var debug = require("debug")("entire");
var routes = undefined;

/** 
 * Options and their default values
 */

var options = {
	styles: "/styles.css",
	scripts: "/scripts.js",
	permissions: true,
	folder: path.join(process.cwd(), "node_modules"),
	ext: "html"
};

/**
 * Setting default render extension.
 */

process.env.ENTIRE_EXT = "html";

/**
 * Are all non default options set?
 */

var setup = false;

/**
 * Array of all the modules. 
 */

var modules; //Set after the folder is provided to setup.

/**
 * Helper function for getting subset of modules bassed on permission
 *
 * @param {String} permission
 * @return {[MODULES]} modules
 * @api private
 */

var getModuleSubset; //Set after the folder is provided to setup.

/**
 * Default middleware for KOA.
 *
 *	Includes:
 * 	  ENTIRE.middleware.styleist
 *    ENTIRE.middleware.scriptor
 *    ENTIRE.middleware.backender
 *    ENTIRE.middleware.statics
 *
 * @api public
 */

var cache = {};
function *ENTIRE (next) {
	this.permission = this.permission || "all";
	if(cache[this.permission]==undefined){
		var middleware = [];

		if(debug.enabled){
			middleware.push(function*(next){
				debug(">>> ENTIRE REQUEST: "+this.path);
				yield next;
				debug("<<< ENTIRE REQUEST: "+this.path);
			});
		}

		middleware = middleware.concat(styleist(this.permission));
		middleware = middleware.concat(scriptor(this.permission));
		middleware = middleware.concat(backender(this.permission));
		middleware = middleware.concat(statics(this.permission));

		cache[this.permission] = compose(middleware);
	}

	yield cache[this.permission].call(this, next);
}

module.exports = ENTIRE;

/**
 * Helper function for getting subset of modules bassed on permission
 *
 * @param {Object} opts
 * @opts {String} folder, {Regex} styles, {Regex} scripts, {Object} permissions
 * @api private
 */

ENTIRE.setup = function(opts){

	if(opts.styles){
		if (opts.styles instanceof String !== true) {
			throw new Error("opts.styles must be a String");
		}
		else{
			options.styles = opts.styles;
		}
	}

	if(opts.scripts){
		if (opts.scripts instanceof String !== true) {
			throw new Error("opts.styles must be a String");
		}
		else{
			options.scripts = options.scripts;
		}
	}

	if(opts.permissions){
		options.permissions = opts.permissions;
	}

	if(opts.ext){
		options.ext = opts.ext;
		process.env.ENTIRE_EXT = options.ext;
	}


	if(opts.folder){
		options.folder = opts.folder;
	}


	modules = makeModules(options.folder);
	getModuleSubset = moduleSubsetFinder(opts.permissions, modules);
	routes = backend(modules, getModuleSubset);

}

/**
 * Styleist Middleware
 * Responds with a compiled css file for the given permission type
 * when this.path matches the styles regex
 *
 * @api: public
 */

function styleist (permission) {
	var subset = getModuleSubset(permission);
	var content;

	return [function*(next){

		if(content==undefined){
			debug(">>> BUILD STYLE FOR "+permission);
			content = yield styleBuilder(subset);
			debug("<<< BUILD STYLE FOR "+permission);
		}

		if (this.path === options.styles) {
			debug(">>> STYLEIST");
			this.type = "text/css";
			this.body = content
			debug("<<< STYLEIST");
		}
		else{
			yield next;
		}
	}]
}

/**
 * Scriptor Middleware
 * Responds with a compiled js file for the given permission type
 * when this.path matches the scripts regex
 *
 * @api: public
 */

function scriptor (permission) {
	var subset = getModuleSubset(permission);
	var content;

	return [function*(next){

		if(content==undefined){
			debug(">>> BUILD STYLE FOR "+permission);
			content = yield scriptBuilder(subset);
			debug("<<< BUILD STYLE FOR "+permission);
		}

		if (this.path===options.scripts) {
			debug(">>> SCRIPTOR");
			this.type = "application/javascript";
			this.body = content;
			debug("<<< SCRIPTOR");
		}
		else{
			yield next;
		}
	}]
}

/**
 * Backend Middleware
 * Matches this.path with module routes.
 * If the module is not in module subset of this.permission, it will 404.
 *
 * @api: public
 */

function backender (permission) {
	var subset = getModuleSubset.names(permission);
	var subsetRoutes = [];

	for(var i=0; i<subset.length; i++){
		if(routes[subset[i]]){
			subsetRoutes = subsetRoutes.concat(routes[subset[i]]);
		}
	}
	return subsetRoutes;
}

/**
 * Statics Middleware
 * Matches this.path with module static files.
 * If the module is not in module subset of this.permission, it will 404.
 *
 * @api: public
 */

function statics (permission) {
	var subset = getModuleSubset(permission);
	var moduleNames = getModuleSubset.names(permission);

	return [function*(next){
		var parts = this.path.split("/");
		var module = parts[1];
		var file = parts.slice(2).join("/");
		var i = moduleNames.indexOf(module);

		if(i!==-1){
			debug(">>> STATICS");
			yield send(this, file, {root:subset[i].base+"/public"});
			debug("<<< STATICS");
		}
		else{
			yield next;
		}
	}];
}
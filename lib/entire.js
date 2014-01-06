/**
 * Module dependencies.
 */

var fs = require("fs");
var path = require("path");
var send = require("koa-send");
var moduleSubsetFinder = require("./moduleSubsetFinder");
var makeFeatures = require("./makeModules");
var styleBuilder = require("./styleBuilder");
var scriptBuilder = require("./scriptBuilder");
var routeBuilder = require("./routeBuilder");
var debug = require("debug")("entire");
var router = undefined;

/** 
 * Options and their default values
 */

var options = {
	styles: /styles\.css$/,
	scripts: /scripts\.js$/,
	permissions: true,
	folder: undefined, //must be set before things can run
	ext: "html"
};

/**
 * Setting default render extension.
 */

process.env.ENTIRE_EXT = "html";

/**
 * Response cache
 * 	used so we don't regen the styles and scripts with each request
 */

var cache = {
	scripts: {},
	styles: {}
};

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
 *    ENTIRE.middleware.router
 *    ENTIRE.middleware.statics
 *
 * @api public
 */

function *ENTIRE (next) {
	var status = entireStatus();
	if(status==="ready"){
		yield ENTIRE.middleware.styleist.call(this,
			ENTIRE.middleware.scriptor.call(this,
				ENTIRE.middleware.router.call(this,
					ENTIRE.middleware.statics.call(this,
						next || noop
					)
				)
			)
		);
	}
	else{
		throw new Error("Entire has yet to be fully setup: "+status);
	}
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
		if (opts.styles instanceof RegExp !== true) {
			throw new Error("opts.styles must be a RegExp");
		}
		else{
			options.styles = opts.styles;
		}
	}

	if(opts.scripts){
		if (opts.scripts instanceof RegExp !== true) {
			throw new Error("opts.styles must be a RegExp");
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
		modules = makeFeatures(opts.folder);
		getModuleSubset = moduleSubsetFinder(opts.permissions, modules);
		router = routeBuilder(modules, getModuleSubset);
	}

}

/**
 * Collection of availble middleare
 *
 * @api: public
 */

ENTIRE.middleware = {};

/**
 * Styleist Middleware
 * Responds with a compiled css file for the given permission type
 * when this.path matches the styles regex
 *
 * @api: public
 */

ENTIRE.middleware.styleist = function * (next) {
	debug(">>> STYLEIST");
	if (options.styles.test(this.path)) {
		if (cache.styles[this.permission] == undefined) {
			debug(">>> BUILDING STYLE: " + this.permission);
			var subset = getModuleSubset(this.permission);
			cache.styles[this.permission] = yield styleBuilder(subset);
			debug("<<< BUILDING STYLE: " + this.permission);
		}

		this.type = "text/css";
		this.body = cache.styles[this.permission];
	}
	else {
		yield next || noop;
	}
	debug("<<< STYLEIST");
}

/**
 * Scriptor Middleware
 * Responds with a compiled js file for the given permission type
 * when this.path matches the scripts regex
 *
 * @api: public
 */

ENTIRE.middleware.scriptor = function * (next) {
	debug(">>> SCRIPTOR");
	if (options.scripts.test(this.path)) {
		if (cache.scripts[this.permission] == undefined) {
			debug(">>> BUILDING SCRIPT: " + this.permission);
			var subset = getModuleSubset(this.permission);
			cache.scripts[this.permission] = yield scriptBuilder(subset);
			debug("<<< BUILDING SCRIPT: " + this.permission);
		}

		this.type = "application/javascript";
		this.body = cache.scripts[this.permission];
	}
	else {
		yield next || noop;
	}
	debug("<<< SCRIPTOR");
}

/**
 * Router Middleware
 * Matches this.path with module routes.
 * If the module is not in module subset of this.permission, it will 401.
 *
 * @api: public
 */

ENTIRE.middleware.router = function * (next) {
	debug(">>> ROUTER");
	yield router.call(this, next || noop);
	debug("<<< ROUTER");
}

/**
 * Statics Middleware
 * Matches this.path with module static files.
 * If the module is not in module subset of this.permission, it will 401.
 *
 * @api: public
 */

ENTIRE.middleware.statics = function *(next) {
	yield next;
	debug(">>> STATICS");
	var parts = this.path.split("/");
	var module = parts[1];
	var file = parts.slice(2).join("/");
	var moduleNames = getModuleSubset.names(this.permission);
	var i = moduleNames.indexOf(module);
	if(i!==-1){
		var subset = getModuleSubset(this.permission);
		yield send(this, file, {root:subset[i].base+"/public"});
	}
	debug("<<< STATICS");
}

/**
 * Gets the setup status of entire
 *
 * @api: private
 */

function entireStatus(){

	if (!options.folder) {
		return "folder must be setup, entire.setup({folder:'some/path'})";
	}

	if(modules===false){
		return "Modules have not been intialized";
	}

	return "ready";
}

/**
 * Safeguard againts middleware not being passed a next
 *
 * @api: private
 */

function *noop() {};
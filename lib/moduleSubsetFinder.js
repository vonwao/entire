var debug = require("debug")("entire");
var sortModules = require("./sortModules");

/**
 * Cached subsets by permissions
 */

var cache = {};

/**
 * Cached subset names by permissions
 */

var cacheNames = {};

var permissionModulePairs; //set by module.exports

var modules; //set by module.exports

/**
 * Creates a subsetFinder
 *
 * @params: {Object} permissionModulePairs, {Object} modules
 * @return: {Function} getSubset
 * @api: public
 */

module.exports = function(pmp, mod) {
	permissionModulePairs = pmp || permissionModulePairs;
	modules = mod || modules;

	return getSubset;
}

/**
 * Finds subsets of the modules bassed on a passed permission and returns kvp
 *
 * @params: {String} permission
 * @return: {Object} modulesByName
 * @api: public
 */

function getSubset(permission){
	permission = ifAll(permission);

	if (isValidPermission(permission)) {
		if (cache[permission] == undefined) {
			var names = getSubset.names(permission);

			var result = [];

			for(var i=0; i<names.length; i++){
				result.push(modules[names[i]]);
			}

			cache[permission] = result;
		}

		return cache[permission];
	}
}

/**
 * Finds subsets of modules bassed on passed permission and returns names
 *
 * @params: {String} permission
 * @return: {Array} moduleNames
 * @api: public
 */

getSubset.names = function(permission) {
	permission = ifAll(permission);

	if (isValidPermission(permission)) {
		if (cacheNames[permission] == undefined) {
			var list = permissionModulePairs[permission];

			var byName = [];

			for (var i = 0; i < list.length; i++) {
				var module = modules[list[i]];
				if (module) {
					byName[module.name] = module;
					module.extends = module.extends || [];
					for (var j = 0; j < module.extends.length; j++) {
						if (list.indexOf(module.extends[j]) == -1) {
							list.push(module.extends[j]);
						}
					}
				}
				else {
					throw new Error("Invalid module in permission or extends set: " + list[i]);
				}
			}

			byName = sortModules(byName);

			cacheNames[permission] = Object.keys(byName);
		}

		return cacheNames[permission];
	}
}

/**
 * Cleans up the sets the passed permission to true if pmp is in accept all mode
 * 
 * @params: {String} permission
 * @return: {String} permission
 * @api: private
 */

function ifAll(permission){
	if (permissionModulePairs === true) {
		permission = "all";
		if (permissionModulePairs["all"] == undefined) {
			permissionModulePairs["all"] = Object.keys(modules);
		}
	}
	return permission;
}

/**
 * Checks if provided permission is in the permission set
 *
 * @params: {String} permission
 * @return: {Bool} true
 * @note: Will throw an error rather than return false
 * @api: private
 */

function isValidPermission(permission){
	if (permissionModulePairs[permission] !== undefined) {
		return true;
	}
	else {
		throw new Error("Invalid Permission Type: "+permission);
	}
}
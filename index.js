var ENTIRE = require("./lib/entire");

module.exports = function(opts){
	if(opts){
		ENTIRE.setup(opts);
	}

	return ENTIRE;
}
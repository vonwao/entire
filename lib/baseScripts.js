var require = function(module) {
	if (require.module[module]) {
		return require.module[module];
	}
	else {
		throw new Error(module + " is not a valid module");
	}
}

require.module = {};
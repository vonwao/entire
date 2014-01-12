var SORT = module.exports = function(modules){

	var moduleNames = Object.keys(modules);
	var allParents = {};

	for(var i=0; i<moduleNames.length; i++){
		allParents[moduleNames[i]] = modules[moduleNames[i]].extends || [];
	}

	for(var i=0; i<moduleNames.length; i++){
		var moduleName = moduleNames[i];
		var parents = allParents[moduleName];

		for(var j=0; j<parents.length; j++){
			var grandParents = allParents[parents[j]];
			for(var k=0; k<grandParents.length; k++){
				if(parents.indexOf(grandParents[k])==-1){
					parents.push(grandParents[k]);
				}
			}
		}
	}

	moduleNames.sort(function(a, b){
		return (allParents[a].length<allParents[b].length) ? 0 : 1;
	});

	var out = {};

	for(var i=0; i<moduleNames.length; i++){
		out[moduleNames[i]] = modules[moduleNames[i]];
	}

	return out;
	
}
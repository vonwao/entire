moudle.exports = function(features) {
	var out = "SCRIPT:";
	for (var i = 0; i < features.length; i++) {
		out += " " + features[i].name;
	}
	return out;
}
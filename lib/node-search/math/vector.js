exports.Vector = function(size) {
	var data = [];
	for(var i=0;i<size;i++){
		data.push(0);
	}
	return {
		data:data
  }
}
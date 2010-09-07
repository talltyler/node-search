exports.VectorUtils = function() {
	return {
		norm: function(vector){
			var maxColSum = 0;
		  var sum = 0;
			var V = vector.data||vector;
		  for (var row = 0; row < V.length; row++) {
				sum += Math.abs(V[row]);
		  }
		  return Math.max(maxColSum, sum);
		},
		dot: function(vector1,vector2) {
		  var product = 0, 
					n = vector1.data.length,
			 		V = vector2.data||vector2;
		  if (n != V.length) { return null; }
		  do { product += vector1.data[n-1] * V[n-1]; } while (--n);
		  return product;
		}
  }
}
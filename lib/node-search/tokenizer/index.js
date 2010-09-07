var DoubleMetaphone = require("../double-metaphone").DoubleMetaphone;
var PorterStemmer = require("../porter-stemmer").PorterStemmer;

exports.Tokenizer = function() {
	return {
		stemmer:PorterStemmer(),
		process: function(words){
			var result = [];
			for( var i=0; i<words.length; i++){
				var word = words[i];
				var metaphones = DoubleMetaphone(this.stemmer.process(word));
				result.push(metaphones.primary);
				if(metaphones.secondary!=null){
					result.push(metaphones.secondary);
				}
			}
			return result;
		}
	}
}
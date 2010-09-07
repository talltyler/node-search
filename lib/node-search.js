var PorterStemmer = require('./node-search/porter-stemmer').PorterStemmer,
		Tokenizer = require('./node-search/tokenizer').Tokenizer,
		DoubleMetaphone = require('./node-search/double-metaphone').DoubleMetaphone,
		Vector = require('./node-search/math/vector').Vector;
		VectorUtils = require('./node-search/math/vector-utils').VectorUtils;


exports.NodeSearch = function() {
	return {
		docs:{all:[]},
		fields:[],
		fieldWeights:{},
		vectorKeywordIndex:{},
		vectorKeywordIndexLength:0,
		index: function(key,doc,callback){
			var self = this;
			var addWords = [];
			var uniques = findUniques(doc);
			uniques.forEach(function(word){
				if( !self.vectorKeywordIndex.hasOwnProperty(word) ){
					self.vectorKeywordIndex[word] = self.vectorKeywordIndexLength;
					self.vectorKeywordIndexLength++;
					addWords.push(word);
				}
			});

			// add zeros to end of other vectors, maybe this should be done another way
			if( addWords.length != 0 ) { 
				Object.keys(self.docs).forEach(function(column){
					self.docs[column].forEach(function(item){
						addWords.forEach(function(word){
							item.data.push(0);
						});
					});
				});
			}

			if( typeof(doc) == "object" ) {
				var fieldsData = "";
				for( var field in doc ){
					if(self.fields.length==0){
						self.fields.push(field);
					}
					fieldsData += doc[field] + " ";
					var vector = makeVector(key, doc[field],self.fieldWeights[field]||1,self.vectorKeywordIndex,self.vectorKeywordIndexLength);
					if( this.docs.hasOwnProperty(field) ){ 
						this.docs[field].push(vector);
					}else{
						this.docs[field] = [vector];
					}
				}
				this.docs.all.push( makeVector(key,fieldsData,1,self.vectorKeywordIndex,self.vectorKeywordIndexLength));
			}else{
				this.docs.all.push( makeVector(key,doc,1,self.vectorKeywordIndex,self.vectorKeywordIndexLength));	
			}
		},
		
		// Query the index, returns an array of documents with id and rank
		query: function(string,fields,callback){

			var docs, vector;
			var words = string.split(" ");
			var count = 0;
			var total = 0;
			var completed = 0;
			var falseMatches = [];
			var results=[];

			for( var word in words){
				if(words[word].charAt(0)=="!"||words[word].charAt(0)=="-"){
					var stemmed = stemmer.process(words[word].split("!").join("").split("-").join(""));
					var index = this.vectorKeywordIndex[DoubleMetaphone(stemmed).primary];
					falseMatches.push(index);
					words.splice(count,1);
				}
				count++
			}
			vector = makeVector("",words.join(" "),1,this.vectorKeywordIndex,this.vectorKeywordIndexLength);

			for(var i = 0; i < vector.data.length; i++){
			 total += vector.data[i];
			}
			if( total == 0 ){
				return [];
			}

			if( fields != null){
				var fieldsName = fields.sort().join("-");
				if( !this.docs.hasOwnProperty(fieldsName) ) {
					// This will be really slow the first time.
					// this.docs[fieldsName] = indexFields(fields,this.docs,function(docs){
						// TODO: need to work on this, can't currently search more than one field at a time
					//});
					return
				}else{
					docs = this.docs[fieldsName];
				}
			}else{
				docs = this.docs.all;
			}

			return asyncForEach( docs,
				function(doc,i,list){
					for( var falseMatch in falseMatches ){ // strip documents that have falsematches
						if(doc.data[falseMatches[falseMatch]]!=0){
							return
						}
					}
					var result = cosine(vector, doc); // figure out how close your querie vector is to the other docs
					if( result != 0 ){ // filter out items that dont match at all
						results.push({key:doc.key, rank:result});
					}
				},
				function(){ // TODO: what if there are millions of results, this sort will be slow.
					callback(results.sort(function (a, b) { return ((b.rank - a.rank)) }));
				}
			);
		},
		
		related: function(key,callback){
			var docs;
			var results=[];
			
			return asyncForEach( this.docs.all,
				function(item,i,list){
					if(item.key == key ){
						asyncForEach( this.docs.all,
							function(doc,i,list){
								var result = cosine(item, doc); // figure out how close your querie vector is to the other docs
								if( result != 0 ){ // filter out items that dont match at all
									results.push({key:doc.key, rank:result});
								}
							},
							function(){ // TODO: what if there are millions of results, this sort will be slow.
								callback(results.sort(function (a, b) { return ((b.rank - a.rank)) }));
							}
						);
						return true;
					}
				},
				function(){}
			);
		}
	}
}

// Private ///////////////////////////////////////////////////////////////////////////////////////////

// Stemming is a way to convert words like speeder and speeds to speed
var stemmer = exports.stemmer = PorterStemmer();

// break string up into tokens and stem words
var tokenizer = exports.tokenizer = Tokenizer();

// Words that will not be indexed
var stopWords = exports.stopWords = ["","a","about","above","above","across","after","afterwards","again","against","all","almost","alone","along","already","also","although","always","am","among","amongst","amoungst","amount","an","and","another","any","anyhow","anyone","anything","anyway","anywhere","are","around","as","at","back","be","became","because","become","becomes","becoming","been","before","beforehand","behind","being","below","beside","besides","between","beyond","bill","both","bottom","but","by","call","can","cannot","cant","co","con","could","couldnt","cry","de","describe","detail","do","done","down","due","during","each","eg","eight","either","eleven","else","elsewhere","empty","enough","etc","even","ever","every","everyone","everything","everywhere","except","few","fifteen","fify","fill","find","fire","first","five","for","former","formerly","forty","found","four","from","front","full","further","get","give","go","had","has","hasnt","have","he","hence","her","here","hereafter","hereby","herein","hereupon","hers","herself","him","himself","his","how","however","hundred","ie","if","in","inc","indeed","interest","into","is","it","its","itself","keep","last","latter","latterly","least","less","ltd","made","many","may","me","meanwhile","might","mill","mine","more","moreover","most","mostly","move","much","must","my","myself","name","namely","neither","never","nevertheless","next","nine","no","nobody","none","noone","nor","not","nothing","now","nowhere","of","off","often","on","once","one","only","onto","or","other","others","otherwise","our","ours","ourselves","out","over","own","part","per","perhaps","please","put","rather","re","same","see","seem","seemed","seeming","seems","serious","several","she","should","show","side","since","sincere","six","sixty","so","some","somehow","someone","something","sometime","sometimes","somewhere","still","such","system","take","ten","than","that","the","their","them","themselves","then","thence","there","thereafter","thereby","therefore","therein","thereupon","these","they","thickv","thin","third","this","those","though","three","through","throughout","thru","thus","to","together","too","top","toward","towards","twelve","twenty","two","un","under","until","up","upon","us","very","via","was","we","well","were","what","whatever","when","whence","whenever","where","whereafter","whereas","whereby","wherein","whereupon","wherever","whether","which","while","whither","who","whoever","whole","whom","whose","why","will","with","within","without","would","yet","you","your","yours","yourself","yourselves","the"];

var vectorKeywordIndexLength = 0;

function indexFields(fields,docs){
	var result = [];
	for( var field in fields){
 		var data = docs[fields[field]];
 		for( i=0; i<this.docs.all.length; i++){
 			for( var h=0; h<data[i].data.length; h++){
 				if(h==0){
 					result.push( Vector(vectorKeywordIndexLength) );
 				}
 				result[i].data[h] += data[i].data[h];
 			}
 		}
 	}
	return result;
}

// Create the keyword associated to the position of the elements within the document vectors
function getVectorKeywordIndex(documents){
	// Mapped documents into a single word string
	var vocabularyString = "";
	for( var i = 0; i < documents.length; i++){
		for( var field in documents[i] ){
			vocabularyString += documents[i][field]+" ";
		}
	}

	//Remove common words which have no search value
	var vocabularyList = tokenizer.process(removeStopWords(vocabularyString));		
	var uniqueVocabularyList = removeDuplicates(vocabularyList);

	var vectorIndex={};
	var offset=0;
	//Associate a position with the keywords which maps to the dimension on the vector used to represent this word
	for( var i = 0; i < uniqueVocabularyList.length; i++){
		var word = uniqueVocabularyList[i];
		vectorIndex[word]=offset;
		offset++;
	}
	vectorKeywordIndexLength = uniqueVocabularyList.length
	return [vectorIndex, uniqueVocabularyList.length]; // (keyword:position)
}

// Create the keyword associated to the position of the elements within the document vectors
function findUniques(doc){
	// Mapped documents into a single word string
	var vocabularyString = "";
	for( var field in doc ){
		vocabularyString += doc[field]+" ";
	}
	//Remove common words which have no search value
	var vocabularyList = tokenizer.process(removeStopWords(vocabularyString));		
	return removeDuplicates(vocabularyList);
}

// Make a vector that has values for each instance of the words contained in each document
function makeVector(key,string,fieldWeight,vectorKeywordIndex,vectorKeywordIndexLength){
	fieldWeight = fieldWeight||0;
	var vector = Vector(vectorKeywordIndexLength);
	var wordList = tokenizer.process(removeStopWords(string));
	for( var i=0; i<wordList.length; i++){
		var word = wordList[i];
		vector.data[vectorKeywordIndex[word]] += 1 * fieldWeight; // Use simple Term Count Model
	}
	vector.key = key;
	return vector;
}

// Remove duplicates from a list
function removeDuplicates(list){
	var result = [];
  o:for(var i=0, n = list.length; i < n; i++){
		for(var x=0, y = result.length; x < y; x++){
			if(result[x]==list[i]) continue o;
		}
		result[result.length] = list[i];
  }
  return result;
}

// related documents j and q are in the concept space by comparing the vectors 
//  cosine  = ( V1 * V2 ) / ||V1|| x ||V2||
function cosine(vector1,vector2){
	var utils = VectorUtils();
	return utils.dot(vector1,vector2) / (utils.norm(vector1) * utils.norm(vector2)); 
}

// remove any nasty grammar tokens from string
function clean(string){
	return string.replace(/[\.\-_&]/g, " ").replace(/\s\s+/g, " ").toLowerCase();
}

// Remove common words which have no search value
function removeStopWords(string){
	var words = clean(string).split(" ");
	var result = [];
	for( var i=0; i<words.length; i++){
		if(stopWords.indexOf(words[i])==-1) result.push(words[i]);
	}
	return result;
}

function map(array, fn) { return function (callback, errback) {
  var counter = array.length;
  var new_array = [];
  array.forEach(function (item, index) {
    var local_callback = function (result) {
      new_array[index] = result;
      counter--;
      if (counter <= 0) {
        new_array.length = array.length
        callback(new_array);
      }
    };
    var cont = fn(item, local_callback, errback);
    if (typeof cont === 'function') {
      cont(local_callback, errback);
    }
  });
}}

/* asyncForEach() */
function asyncForEach(list,handler,callback) {
	var i = 0;
	function next() {
		handler(list[i], i, list);
		i++;
		if (i == list.length){
			callback();
		}else if (i % 10 == 0) {
			process.nextTick(next);
		}else{
			next();
		}
  }
	next();
}
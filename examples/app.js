var NodeSearch = require('./../lib/node-search').NodeSearch;
var nStore = require('./lib/nstore');

// A simple data set to search over, feel free to use any data source, nstore uses JavaScript objects so it's simple
var db = nStore('data/example.db');

var search = new NodeSearch();
search.fieldWeights.title = 2; // Make one/or many of the document fields more important
var stream = db.stream();
stream.addListener('data', function (doc, meta) {
	search.index(meta.key,doc);
});

stream.addListener('end', function () {
	search.query("meet !poultry", null, function (results) {
		results.forEach(function(result){
			db.get(result.key, function (err, doc, meta) {
				if(err) throw err;
				console.log(result.key+" "+doc.title +" "+doc.body +" "+  result.rank);
			});
		});
	});
});
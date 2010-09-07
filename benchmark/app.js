var NodeSearch = require('./../lib/node-search').NodeSearch;
var nStore = require('./lib/nstore');

// A simple data set to search over, feel free to use any data source
var db = nStore('data/example.db');

// create a sample database to test from
for(var i=10,l=1000;i<l;i++){ 
	db.save(i,{title:"title",body:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi."});
}

var startIndex = new Date().getTime();

var search = new NodeSearch();
search.fieldWeights.title = 5; // Make one/or many of the document fields more important
var stream = db.stream();
stream.addListener('data', function (doc, meta) {
	search.index(meta.key,doc);
});

stream.addListener('end', function () {
	console.log( "Indexing has taken " + (new Date().getTime() - startIndex ).toString() );
	var startSearch = (new Date).getTime();
	search.query("meet !poultry", null, function (results) {
		console.log( "Searching has taken " + (new Date().getTime() - startSearch).toString() );
		results.forEach(function(result){
			db.get(result.key, function (err, doc, meta) {
				if(err) throw err;
				console.log(result.key+" "+doc.title +" "+doc.body +" "+  result.rank);
			});
		});
	});
});
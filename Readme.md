# A JavaScript full text search engine

This is an implementation of a "vector space model" with "Porter stemming", "double-metaphones", false boolean searches, field searching and field weighting. Basically it a full text search engine that has most of the fancy features the well known search engines libraries like Sphinx, Solr, Lucene, etc. The big difference is that it is written in JavaScript originally for use with Node.js.


## Example

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

	stream.addListener('end', function () { // when the indexing is finished
		search.query("meet !poultry", null, function (results) { // search and wait for the results
			results.forEach(function(result){
				db.get(result.key, function (err, doc, meta) { 
					if(err) throw err;
					console.log(result.key+" "+doc.title +" "+doc.body +" "+  result.rank);
				});
			});
		});
	});

	
## This code is based on idea and code from

	http://blog.josephwilk.net/projects/building-a-vector-space-search-engine-in-python.html
	http://github.com/maritz/js-double-metaphone/raw/master/double-metaphone.js
	http://yeti-witch.googlecode.com/svn/trunk/lib/porter-stemmer.js
	http://www.koders.com/javascript/fidACD9DF0C1463CFC127D8C8B767B77122F3FC7331.aspx
	http://playnice.ly/blog/2010/05/05/a-fast-fuzzy-full-text-index-using-redis/
	http://users.telenet.be/paul.larmuseau/SVD.htm
	http://gist.github.com/389875
	http://sylvester.jcoglan.com/api/matrix
	http://www.uni-bonn.de/~manfear/matrixcalc.php
	http://www.sphinxsearch.com/docs/manual-1.10.html#boolean-syntax
	http://stackoverflow.com/questions/90580/word-frequency-algorithm-for-natural-language-processing
	http://stackoverflow.com/questions/2699646/how-to-get-logical-parts-of-a-sentence-with-java


## Things that it doesn't currently do but would like to look into:	

	Phrase based searches, everything is word based, combonations of words are not currently supported
	Exact matches, all words are converted to stemmed metaphones so "ponies" is indexed as the sound of "pony".
	Date based searches or other meta data with additional logic are not currently supported
	tf-idf based ranking, currently using a term count
	http://blog.josephwilk.net/projects/latent-semantic-analysis-in-python.html
	http://en.wikipedia.org/wiki/Lanczos_method
	http://en.wikipedia.org/wiki/Latent_semantic_indexing
	http://en.wikipedia.org/wiki/Probabilistic_latent_semantic_analysis
	http://en.wikipedia.org/wiki/Latent_Dirichlet_allocation
	http://en.wikipedia.org/wiki/Part-of-speech_tagging


## License 

(The MIT License)

Copyright (c) 2009 Motion &amp; Color &lt;Tyler Larson&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
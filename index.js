var es = require("event-stream");
var zlib = require("zlib");
var clone = require('clone');

module.exports = function() {
	'use strict';

	function compress(file, callback) {

		// Use zlib to compress the file
		if(file.isBuffer()) {
		
	    // Clone file and append .gz file extension
	    var newFile = clone(file);
	    newFile.path += '.gz';
	    newFile.shortened += '.gz';
		  zlib.gzip(newFile.contents, function(err, buffer) {
			  if (!err) {
				  // Set the compressed file contents
		      	newFile.contents = buffer;
		      	callback(null, newFile);
		    	} else {
		    		callback(err, null);
		    	}
		  });
		} else {
	    file.path += '.gz';
	    file.shortened += '.gz';
		  file.contents = file.contents.pipe(zlib.createGzip());
     	callback(null, file);
		}
	}

	return es.map(compress);
};

var es = require("event-stream");
var zlib = require("zlib");
var clone = require('clone');
util = require("util");

module.exports = function() {
	'use strict';

	function compress(file, callback) {

		// Clone file and append .gz file extension
		var newFile = clone(file);
		newFile.path += '.gz';
		newFile.shortened += '.gz';

		// console.log(util.inspect(newFile));

		// Use zlib to compress the file
		zlib.gzip(newFile.contents, function(err, buffer) {
			if (!err) {
				// Set the compressed file contents
		    	newFile.contents = buffer;
		    	callback(null, newFile);
		  	} else {
		  		callback(err, null);
		  	}
		});
	}

	return es.map(compress);
};
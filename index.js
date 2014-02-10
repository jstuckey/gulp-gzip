var es = require("event-stream");
var zlib = require("zlib");
var clone = require("clone");

module.exports = function() {
	'use strict';

	function compress(file, callback) {

		 if (file.isNull()) return callback(null, file); // pass along

		// Clone file and append .gz file extension
		var newFile = clone(file);
		newFile.path += '.gz';
		newFile.shortened += '.gz';

		// Check if file is a buffer or a stream
		if(file.isBuffer()) {

			// File contents is a buffer
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

			// File contents is a stream
			var gzipStream = zlib.createGzip();
			newFile.contents = file.contents.pipe(gzipStream);
			callback(null, newFile);
		}
	}

	return es.map(compress);
};

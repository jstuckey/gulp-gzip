var through2    = require('through2');
var zlib        = require('zlib');
var PluginError = require('gulp-util').PluginError;
var utils		= require('./libs/utils');

var PLUGIN_NAME = 'gulp-gzip';

'use strict';

module.exports = function (options) {

	// Combine user defined options with default options
	var config = utils.merge({ append: true, threshold: false }, options);

	// Create a through2 stream
	var stream = through2.obj(compress);

	// Expose config object
	stream.config = config;

	function compress(file, enc, done) {

		var self = this;

		// Check for empty file
		if (file.isNull()) {
			// Pass along the empty file to the next plugin
			self.push(file);
			done();
			return;
		}

		// Clone the file
		var newFile = file.clone();

		// Append file extension if the option is set
		if (config.append) newFile.path += '.gz';

		// Check if file contents is a buffer or a stream
		if(file.isBuffer()) {
			// File contents is a buffer

			// Check if the threshold option is set
			// If true, check if the buffer length is greater than the threshold
			if (config.threshold && file.contents.length < config.threshold) {
				// File size is smaller than the threshold
				// Pass it along to the next plugin without compressing
				self.push(file);
				done();
				return;
		    }

		    // Compress the file contents as a buffer
			zlib.gzip(newFile.contents, function(err, buffer) {

				if (err) {
					var error = new PluginError(PLUGIN_NAME, err, { showStack: true });
					self.emit('error', error);
					done();
					return;
				}

				// Set the compressed file contents
				newFile.contents = buffer;
				self.push(newFile);
				done();
				return;
			});
		} else {
			// File contents is a stream

			// Check if the threshold option is set
			if (config.threshold) {
				// Check if the stream contents is greater than the threshold
				utils.checkThresholdForStream(
					file.contents,
					config.threshold,
					function() {
						// File size is smaller than the threshold
						// Pass it along to the next plugin without compressing
						self.push(file);
						done();
						return;
					},
					function() {
						// File is large enough to compress
						// Compress the file contents as a stream
						var gzipStream = zlib.createGzip();
						newFile.contents = file.contents.pipe(gzipStream);
						self.push(newFile);
						done();
					}
				);
			} else {
				// Compress the file contents as a stream
				var gzipStream = zlib.createGzip();
				newFile.contents = file.contents.pipe(gzipStream);
				self.push(newFile);
				done();
			}
		}
	}

	return stream;
}

/*jslint node: true */
'use strict';

var through2    = require('through2');
var zlib        = require('zlib');
var PluginError = require('gulp-util').PluginError;
var utils       = require('./lib/utils');

var PLUGIN_NAME = 'gulp-gzip';

module.exports = function (options) {

	// Combine user defined options with default options
	var config = utils.merge({ append: true, threshold: false, gzipOptions: {} }, options);

	// Create a through2 object stream. This is our plugin export
	var stream = through2.obj(compress);

	// Expose the config so we can test it
	stream.config = config;

	function compress(file, enc, done) {

		/*jshint validthis: true */
		var self = this;

		// Check for empty file
		if (file.isNull()) {
			// Pass along the empty file to the next plugin
			self.push(file);
			done();
			return;
		}

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
			zlib.gzip(file.contents, function(err, buffer) {

				if (err) {
					var error = new PluginError(PLUGIN_NAME, err, { showStack: true });
					self.emit('error', error);
					done();
					return;
				}

				// Set the compressed file contents
				file.contents = buffer;
				if (config.append) file.path += '.gz';
				self.push(file);
				done();
				return;
			});
		} else {
			// File contents is a stream

			// Check if the threshold option is set
			if (config.threshold) {
				// Check if the stream contents is less than the threshold
				utils.streamThreshold(
					file.contents,
					config.threshold,
					function(contentStream) {
						// File size is smaller than the threshold
						// Pass it along to the next plugin without compressing
						file.contents = contentStream;
						self.push(file);
						done();
						return;
					},
					function(contentStream) {
						// File size is greater than the threshold
						// Compress the file contents as a stream
						var gzipStream = zlib.createGzip(config.gzipOptions);
						file.contents = contentStream.pipe(gzipStream);
						if (config.append) file.path += '.gz';
						self.push(file);
						done();
					}
				);
			} else {
				// Compress the file contents as a stream
				var gzipStream = zlib.createGzip(config.gzipOptions);
				file.contents = file.contents.pipe(gzipStream);
				if (config.append) file.path += '.gz';
				self.push(file);
				done();
			}
		}
	}

	return stream;
};

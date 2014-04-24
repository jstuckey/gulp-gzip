var through2 = require('through2');
var zlib     = require('zlib');
var toArray  = require('stream-to-array');

module.exports = function(contents, options, callback) {
	// File contents is a stream

	// Check if the threshold option is set
	if (options.threshold) {
		// Check if the stream contents is less than the threshold
		streamThreshold(
			contents,
			options.threshold,
			function(contentStream) {
				// File size is smaller than the threshold
				// Pass it along to the next plugin without compressing
				callback(null, contentStream, false);
			},
			function(contentStream) {
				// File size is greater than the threshold
				// Compress the file contents as a stream
				var gzipStream = zlib.createGzip(options.gzipOptions);
				callback(null, contentStream.pipe(gzipStream), true);
			}
		);
	} else {
		// Compress the file contents as a stream
		var gzipStream = zlib.createGzip(options.gzipOptions);
		callback(null, contents.pipe(gzipStream), true);
	}
};

function streamThreshold(inStream, threshold, fileTooSmall, fileLargeEnough) {

	toArray(inStream, function (err, chunks) {
		// Join chunks array into a single buffer
		var buffer = Buffer.concat(chunks);

		// Create a stream to return to the callback and write the file contents to it
		// Need a new stream to return since we already consumed the contents of inStream
		var outStream = through2();
		outStream.end(buffer);

		// Check if the stream content length is less than the threshold
		if (buffer.length < threshold) {
			// File does not meet the minimum size requirement for compression
			fileTooSmall(outStream);
		} else {
			// File meets the minimum size requirement for compression
			fileLargeEnough(outStream);
		}
	});
}
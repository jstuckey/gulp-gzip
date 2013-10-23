var gzip = require("../");
var zlib = require("zlib");
var should = require("should");
var gulp = require("gulp");
var es = require("event-stream");
var fs = require("fs");
var util = require("util");

require("mocha");

describe("gulp-gzip", function() {
	describe("compress", function() {

		it("should append gz to the file extension", function(done) {
			gulp.src("*.txt")
			.pipe(gzip())
			.pipe(es.map(function(file, cb) {
				file.path.should.endWith("gz");
				file.shortened.should.endWith("gz");
				cb(null, null);
				done();
			}));
		});

		it('should return file contents as a buffer', function(done) {
			gulp.src("*.txt")
			.pipe(gzip())
			.pipe(es.map(function(file, cb) {
				file.contents.should.be.instanceof(Buffer); // should.have.type didn't work
				cb(null, null);
				done();
			}));
		});

		it("should create a .gz file", function(done) {

			var outStream = gulp.dest("./")

			outStream.on("close", function() {
				// The new file was written to the file system
				fs.readFile("./input.txt.gz", function(err, file) {

					// console.log(util.inspect(file));

					// Check if the file was found
					should.not.exist(err);
  					should.exist(file);
					file.should.not.be.empty;

					done();
				});
			});

			gulp.src("*.txt")
			.pipe(gzip())
			.pipe(outStream);
		});

		it("should match uncompressed file with original file", function(done) {

			var outStream = gulp.dest("./")

			outStream.on("close", function() {

				// Get compressed file
				fs.readFile("./input.txt.gz", function(err, file) {
					// Uncompress the file
					zlib.unzip(file, function(err, uncompressedFileBuffer) {

						uncompressedFile = uncompressedFileBuffer.toString("utf8", 0, uncompressedFileBuffer.length);
						// console.log(util.inspect(uncompressedFile));

						// Get original file
						fs.readFile("./input.txt", {encoding: "utf8"}, function(err, originalFile) {
							// console.log(util.inspect(originalFile));
							originalFile.should.equal(uncompressedFile);

							done();
						});
					});
				});
			});

			gulp.src("*.txt")
			.pipe(gzip())
			.pipe(outStream);
		});

	});
});
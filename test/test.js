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
				// Check if file properties end with .gz
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
				// Check if file contents is a Buffer object
				file.contents.should.be.instanceof(Buffer); // should.have.type didn't work
				cb(null, null);
				done();
			}));
		});

		it("should create a .gz file", function(done) {

			var outStream = gulp.dest("./")

			// Capture close event of the write stream so we know when gulp.dest finishes
			outStream.on("close", function() {
				// Get the compressed file
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

			// Capture close event of the write stream so we know when gulp.dest finishes
			outStream.on("close", function() {

				// Get the compressed file
				fs.readFile("./input.txt.gz", function(err, file) {
					// Uncompress the file
					zlib.unzip(file, function(err, uncompressedFileBuffer) {
						// Convert buffer to utf8 string
						uncompressedFile = uncompressedFileBuffer.toString("utf8", 0, uncompressedFileBuffer.length);
						// console.log(util.inspect(uncompressedFile));

						// Get original file as utf8 string
						fs.readFile("./input.txt", {encoding: "utf8"}, function(err, originalFile) {
							// console.log(util.inspect(originalFile));

							// Compare the original file to the uncompressed .gz file
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
var gzip = require("../");
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

		it("should create a file in the destination", function(done) {

			var outStream = gulp.dest("./")

			outStream.on("close", function() {
				// The new file was written to the file system
				fs.readFile("./input.txt.gz", function(err, file) {

					console.log(util.inspect(file));

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

	});
});
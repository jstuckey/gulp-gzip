var gulp = require("gulp");
var gzip = require("./");

// Test
var license = require("gulp-license")

gulp.task('compress', function() {
	gulp.src("*.js")
	.pipe(gzip())
	.pipe(gulp.dest("./output"));
});

gulp.task('default', function() {
  gulp.run('compress');
});
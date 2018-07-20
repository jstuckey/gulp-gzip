var del  = require('del');
var gulp = require('gulp');
var gzip = require('../../index');

gulp.task('clean', function(cb) {
  return del('tmp', cb);
});

gulp.task('compress', ['clean'], function() {
  gulp.src('../files/small.txt')
    .pipe(gzip())
    .pipe(gulp.dest('tmp'));
});

gulp.task('default', ['compress']);

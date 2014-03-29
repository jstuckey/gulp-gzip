var clean   = require('gulp-clean');
var filter  = require('gulp-filter');
var gulp    = require('gulp');
var mocha   = require('gulp-mocha');
var plumber = require('gulp-plumber');
var watch   = require('gulp-watch');

var root = __dirname;

gulp.task('watch', function() {
  gulp.src(['index.js', 'gulpfile.js', 'test/*.js'], { read: false })
    .pipe(watch({ emit: 'all', name: 'Mocha' }, function(files) {
      // monkeys are fixing `cwd` for `gulp-mocha`
      // node lives in one process/scope/directory
      process.chdir(root);

      files
        .pipe(plumber())
        .pipe(filter('test.js'))
        .pipe(mocha({ reporter: 'spec' }));
    }))
    .pipe(plumber());
});

gulp.task('clean', function() {
  gulp.src([
    'examples/*/tmp',
    'test/*.txt.gz',
    'test/tmp'
  ]).pipe(clean());
});

gulp.task('default', ['watch']);

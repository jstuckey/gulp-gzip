var clean   = require('gulp-clean');
var filter  = require('gulp-filter');
var gulp    = require('gulp');
var mocha   = require('gulp-mocha');
var watch   = require('gulp-watch');

var root = __dirname;

gulp.task('watch', function() {
  gulp.src([ 'lib/*.js' , 'test/test.js' ], { read: false,  })
    .pipe(watch({ /*emit: 'all',*/ name: 'Mocha', read: false }, function(files) {
      // monkeys are fixing `cwd` for `gulp-mocha`
      // node lives in one process/scope/directory
      process.chdir(root);

      gulp.src('test/test.js')
        .pipe(mocha({ reporter: 'spec', slow: 100 }));
    }));
});

gulp.task('clean', function() {
  gulp.src([
    'examples/*/tmp',
    'test/tmp'
  ]).pipe(clean());
});

gulp.task('default', ['watch']);

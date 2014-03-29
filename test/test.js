var clean   = require('gulp-clean');
var fs      = require('fs');
var gulp    = require('gulp');
var gzip    = require('../');
var nid     = require('nid');
var rename  = require('gulp-rename');
var should  = require('should');
var Stream  = require('stream');
var tap     = require('gulp-tap');
var zlib    = require('zlib');

// monkeys are fixing cwd for gulp-mocha
// node lives in one process/scope/directory
process.chdir('./test');

describe('gulp-gzip', function() {
  describe('configuration', function() {
    it('should have default config', function(done) {
      var instance = gzip();
      instance.config.should.eql({ append: true, threshold:  false });
      done();
    });

    it('should merge options with defaults', function(done) {
      var instance = gzip({ append: false });
      instance.config.should.eql({ append: false, threshold: false });
      done();
    });

    it('should set threshold to false while receiving false', function(done) {
      var instance = gzip({ threshold: false });
      instance.config.threshold.should.be.false;
      done();
    });

    it('should set threshold to 1024 while receiving true', function(done) {
      var instance = gzip({ threshold: true });
      instance.config.threshold.should.eql(1024);
      done();
    });

    it('should set threshold to Number while receiving Number', function(done) {
      var instance = gzip({ threshold: 1024 });
      instance.config.should.have.property('threshold', 1024);
      done();
    });

    it('should set threshold to Number while receiving String (bytes package)', function(done) {
      var instance = gzip({ threshold: '1kb' });
      instance.config.should.have.property('threshold', 1024);
      done();
    });
  });

  describe('handling', function() {
    it('should append .gz suffix, by default', function(done) {
      gulp.src('files/small.txt')
        .pipe(gzip())
        .pipe(tap(function(file) {
          file.path.should.endWith('.gz');
          done();
        }));
    });

    it('should not append .gz suffix getting { append: false }', function(done) {
      gulp.src('files/small.txt')
        .pipe(gzip({ append: false }))
        .pipe(tap(function(file) {
          file.path.should.not.endWith('.gz');
          done();
        }));
    });

    it('should return file contents as a Buffer in buffer mode', function(done) {
      gulp.src('files/small.txt')
        .pipe(gzip())
        .pipe(tap(function(file) {
          file.contents.should.be.instanceof(Buffer);
          done();
        }));
    });

    it('should return file contents as a Stream in stream mode', function(done) {
      gulp.src('files/small.txt', { buffer: false })
        .pipe(gzip())
        .pipe(tap(function(file) {
          file.contents.should.be.instanceof(Stream);
          done();
        }));
    });

    it('should create .gz file in buffer mode', function(done) {
      var id = nid();
      var out = gulp.dest('tmp');

      out.on('close', function() {
        fs.readFile('./tmp/' + id + '.txt.gz', function(err, file) {
          should.not.exist(err);
          should.exist(file);
          file.should.not.be.empty;
          done()
        });
      });

      gulp.src('files/small.txt')
        .pipe(rename({ basename: id }))
        .pipe(gzip())
        .pipe(out);
    });

    it('should match original when result being uncompressed in buffer mode', function(done) {
      var id = nid();
      var out = gulp.dest('tmp');
      var file;

      out.on('close', function() {
        fs.readFile('./tmp/' + id + '.txt.gz', function(err, file) {
          zlib.unzip(file, function(err, buffer) {
            file = buffer.toString('utf-8', 0, buffer.length);

            fs.readFile('./files/small.txt', { encoding: 'utf-8' }, function(err, original) {
              original.should.equal(file);
              done();
            });
          });
        });
      });

      gulp.src('files/small.txt')
        .pipe(rename({ basename: id }))
        .pipe(gzip())
        .pipe(out);
    });
  });
});

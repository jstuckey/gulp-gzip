var merge       = require('./utils').merge;
var PluginError = require('gulp-util').PluginError;
var through2    = require('through2');
var zlib        = require('zlib');

// var log = console.log.bind(console);

var PLUGIN_NAME = 'gulp-gzip';

function plugin(options) {
  var config = merge({ append: true, threshold: false }, options);
  var stream = through2.obj(compress);

  stream.config = config;

  function compress(file, enc, done) {
    var buffer, buffers, newFile, threshold, stream;
    var self = this;

    if (file.isNull()) {
      self.push(file);
      return done();
    }

    newFile = file.clone();

    if (config.append) newFile.path += '.gz';

    if ((threshold = config.threshold) || file.isBuffer()) {
      if (file.isStream()) {
        buffers = [];

        file.contents.pipe(
          through2(function(buffer, enc, next) {
            buffers.push(buffer);
            next();
          }, function() {
            buffer = Buffer.concat(buffers);

            if (buffer.length < threshold) {
              stream = through2();

              stream.write(buffer);
              stream.end();

              file.contents = stream;
              self.push(file);

              return done();
            }

            zlib.gzip(buffer, function(err, buffer) {
              if (err) {
                var error = new PluginError(PLUGIN_NAME, err, { showStack: true });
                self.emit('error', error);
                return done();
              }

              stream = through2();

              stream.write(buffer);
              stream.end();

              newFile.contents = stream;
              self.push(newFile);

              done();
            });
          }));
        return;
      }

      if (threshold && file.contents.length < threshold) {
        self.push(file);
        return done();
      }

      zlib.gzip(file.contents, function(err, buffer) {
        if (err) {
          var error = new PluginError(PLUGIN_NAME, err, { showStack: true });
          self.emit('error', error);
          return done();
        }

        newFile.contents = buffer;
        self.push(newFile);
        done();
      });
      return;
    }

    newFile.contents = file.contents.pipe(zlib.createGzip());
    self.push(newFile);
    done();
  }

  return stream;
}


module.exports = plugin;

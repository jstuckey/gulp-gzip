var bytes = require('bytes');
var es    = require('event-stream');
var zlib  = require('zlib');

module.exports = function(options) {
  'use strict';

  var config, defaults, map;

  defaults = {
       append: true,
    threshold: false
  };

  config     = merge(defaults, options);
  map        = es.map(compress);
  map.config = config;

  function compress(file, cb) {
    var buffer, buffers, newFile, streamHandler;

    if (file.isNull()) return cb(null, file);

    newFile = file.clone();

    if (config.append) {
      newFile.path += '.gz';
    }

    // handle Buffer or Buffer/Stream with threshold
    if (config.threshold || file.isBuffer()) {
      // handle Stream
      if (file.isStream()) {
        // buffering array
        buffers = [];

        // buffer, process and pass through the stream
        streamHandler = es.through(function(data) {
            // buffer chunks
            buffers.push(data);
          }, function() {
            // join bufferd chunks
            buffer = Buffer.concat(buffers);

            // handle too small files
            if (buffer.length < config.threshold) {
              return cb(null, file);
            }

            // gzip file
            zlib.gzip(buffer, function(err, buffer) {
              if (err) return cb(err, null);

              // recreate Stream and pass it back into flow
              newFile.contents = es.readArray([buffer]);
              cb(null, newFile);
            });
        });

        file.contents.pipe(streamHandler)
      // handle simple Buffer
      } else {
        if (file.contents.length < config.threshold) {
          return cb(null, file);
        }

        zlib.gzip(file.contents, function(err, buffer) {
          if (err) return cb(err, null);

          newFile.contents = buffer;
          cb(null, newFile);
        });
      }
    } else { // handle Stream without `threshold` option
      newFile.contents = file.contents.pipe(zlib.createGzip());
      cb(null, newFile);
    }
  }

  return map;
};

function merge(target, source) {
  if (typeof source === 'undefined') source = {};

  Object.keys(source).forEach(function(key) {
    if (key === 'threshold') {
      switch (typeof source[key]) {
        case 'string':
          target[key] = bytes(source[key]);
          break;
        case 'number':
          target[key] = source[key];
          break;
        case 'boolean':
          target[key] = !source[key] ? false : 1024;
        default:
          break;
      }
    } else {
      target[key] = source[key];
    }
  });

  return target;
}

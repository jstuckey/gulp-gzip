# gulp-gzip2 - temporary repository of [gulp-gzip](https://github.com/jstuckey/gulp-gzip)
Gzip plugin for [gulp](https://github.com/wearefractal/gulp).

# Install
`install --save-dev gulp-gzip`

# Usage
```javascript
var gulp      = require('gulp');
var requirejs = require('gulp-module-requirejs');
var uglify    = require('gulp-uglify');
var gzip2     = require('gzip2');

gulp.task('build', function() {
  gulp.src('src/main.js')
    .pipe(requirejs())
    .pipe(uglify())
    // default behavior
    //.pipe(gzip2())
    // OR
    // do NOT append .gz extension
    // .pipe(gzip({ append: false }))
    // OR
    // can pass Boolean|String|Number - details below
    // .pipe(gzip({ threshold: true }));
    .pipe(gzip( append: false, threshold: '1kb' ))
    .pipe(gulp.src('dist'));
});

gulp.task('default', ['build']);
```

# Options
Plugin options:
- append `Boolean`
  - Default is `true` append `gz` extension.
  - When `false` do NOT apend `gz` extension. Some CDNs can handle files without `gz` extension, responsing with  `Content-Encoding: gzip`
- threshold `Boolean|Number|String`
  - Default is `false` passes all files, ignoring their sizes.
  - When `true` sets to 150, why see below.
  - When `Number` sets passed value.
  - When `String` firstly the value parsed by [`bytes`](https://github.com/visionmedia/bytes.js) package, then sets received value.
  - When `Number|String` cases, if resulting value is less then 150, it sets to hard coded value - 150. [Reason](https://developers.google.com/speed/docs/best-practices/payload#GzipCompression).

# License
The MIT License (MIT)

Copyright (c) 2014 Alex Fork

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

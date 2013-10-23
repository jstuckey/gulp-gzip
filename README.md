gulp-gzip
=========

Gzip plugin for [gulp](https://github.com/wearefractal/gulp).

#Install

```
npm install gulp-gzip
```

#Examples

```javascript
var gulp = require("gulp");
var gzip = require("gulp-gzip");

gulp.task("compress", function() {
	gulp.src("./dev/scripts/*.js")
	.pipe(gzip())
	.pipe(gulp.dest("./public/scripts"));
});

gulp.task("default", function() {
  gulp.run("compress");
});
```

```javascript
var gulp = require("gulp");
var coffee = require("gulp-coffee");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var gzip = require("gulp-gzip");

gulp.task("deployScripts", function() {
	gulp.src("./dev/scripts/*.js")
	.pipe(coffee())
	.pipe(concat("all.js"))
	.pipe(uglify())
	.pipe(gzip())
	.pipe(gulp.dest("./public/scripts"));
});

gulp.task("default", function() {
  gulp.run("deployScripts");
});
```
'use strict';

var gulp    = require('gulp'),
    concat  = require('gulp-concat'),
    rename  = require('gulp-rename'),
    uglify  = require('gulp-uglify');

gulp.task("default", [], function() {
  console.log("This is the default task");
});

gulp.task("build", function() {
  gulp.src( [
    'app/app.js'
  ])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('build'))
    .pipe(rename('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build'));
    //copy to build: package.json, src/*, cd build && npm install --production
});

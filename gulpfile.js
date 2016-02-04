'use strict';

var gulp    = require('gulp'),
    concat  = require('gulp-concat'),
    rename  = require('gulp-rename'),
    uglify  = require('gulp-uglify');

gulp.task("default", ["cleanScripts"], function() {
  console.log("This is the default task!");
});

gulp.task("cleanScripts", function() {
  gulp.src( [
    'app/app.js'
  ])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('build'))
    .pipe(rename('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build'));
});

//npm install --save-dev gulp gulp-autoprefixer browser-sync gulp-uglify gulp-cssnano pump gulp-rename run-sequence gulp-sass gulp-clean emitter-steward
var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var pump = require('pump');
var rename = require("gulp-rename");
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var clean = require('gulp-clean');
var src = 'source/';
var build = 'build/';
var cssDirSrc = src + 'css/';
var jsDirSrc = src + 'js/';
var imgDirSrc = src + 'img/';
var cssDirBuild = build + 'css/';
var jsDirBuild = build + 'js/';
var imgDirBuild = build + 'img/';

gulp.task('watch', ['browserSync', 'build'], function() {
  gulp.watch(cssDirSrc + '*.scss', ['postCSS']);
  gulp.watch(src + '**/*.*', ['copy']);
  gulp.watch(jsDirSrc + '*.js', ['compressJS']);
})

gulp.task('build', function() {
  runSequence('clean', 'copy', 'postCSS', 'compressJS');
  console.log('Build done!');
});

gulp.task('clean', function() {
  return gulp.src(build)
    .pipe(clean());
});

gulp.task('copy', function() {
  runSequence('copyHTML', 'copyImages', browserSync.reload);
});

gulp.task('copyHTML', function() {
  return gulp.src(src + '**/*.html')
    .pipe(gulp.dest(build));
})

gulp.task('copyImages', function() {
  return gulp.src(imgDirSrc + '**/*')
    .pipe(gulp.dest(imgDirBuild));
})

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: build
    },
  })
});

gulp.task('postCSS', function() {
  runSequence('sass', 'prefixCSS', 'compressCSS', browserSync.reload);
});

gulp.task('sass', function() {
  return gulp.src(cssDirSrc + '**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest(build + 'css/'));
});

gulp.task('prefixCSS', function() {
  return gulp.src([build + 'css/*.css', '!' + build + 'css/*.min.css'])
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: true
    }))
    .pipe(gulp.dest(build + 'css/'))
});

gulp.task('compressCSS', function() {
  return gulp.src([build + 'css/*.css', '!' + build + 'css/*.min.css'])
    .pipe(rename({
      dirname: build + 'css/',
      suffix: '.min'
    }))
    .pipe(cssnano())
    .pipe(gulp.dest('./'))
});

gulp.task('compressJS', function(cb) {
  pump([
      gulp.src(jsDirSrc + '*.js'),
      rename({
        dirname: jsDirBuild,
        suffix: '.min'
      }),
      uglify(),
      gulp.dest('./'),
      browserSync.stream()
    ],
    cb
  );
});
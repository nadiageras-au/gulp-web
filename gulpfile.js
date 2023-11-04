'use strict';
//import autoprefixer from 'gulp-autoprefixer';

const { src, dest } = require('gulp');
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cssbeautify = require('gulp-cssbeautify');
const removeComment = import('gulp-strip-css-comments');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const rigger = require('gulp-rigger');
const uglify = require('gulp-uglify');
const plumber = require('gulp-plumber');
const imagemin = import('gulp-imagemin');
const del = import('del');
const cleanD = require('gulp-dest-clean');
const panini = require('panini');
const browsersync = require('browser-sync').create();

var path = {
  build: {
    html: 'dist/',
    js: 'dist/assets/js',
    css: 'dist/assets/css',
    images: 'dist/assets/img',
  },
  src: {
    html: 'src/*.html',
    js: 'src/assets/js/*.js',
    css: 'src/assets/sass/style.scss',
    images: 'src/assets/img/**/*.{jpg,png,svg,gif,ico,jpeg}',
  },
  watch: {
    html: 'src/**/*.html',
    js: 'src/assets/js/**/*.js',
    css: 'src/assets/sass/**/*.scss',
    images: 'src/assets/img/**/*.{jpg,png,svg,gif,ico,jpeg}',
  },
  clean: './dist',
};

/* Tasks */
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: './dist',
    },
    port: 3000,
  });
}

function browserSyncReload(done) {
  browsersync.reload();
}

function html() {
  return src(path.src.html, { base: 'src/' })
    .pipe(plumber())
    .pipe(dest(path.build.html));
}

function css() {
  return src(path.src.css, { base: 'src/assets/sass/' })
    .pipe(plumber())
    .pipe(sass())
    .pipe(
      autoprefixer({
        browsers: ['last 8 versions'],
        cascade: true,
      })
    )
    .pipe(cssbeautify())
    .pipe(dest(path.build.css))
    .pipe(
      cssnano({
        zindex: false,
        discardComments: {
          removeAll: true,
        },
      })
    )
    .pipe(removeComments())
    .pipe(
      rename({
        suffix: '.min',
        extname: '.css',
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

function js() {
  return src(path.src.js, { base: './src/assets/js' })
    .pipe(plumber())
    .pipe(rigger()) // склейка js-файлов
    .pipe(gulp.dest(path.build.js))
    .pipe(uglify()) // сжатие
    .pipe(
      rename({
        suffix: '.min',
        extname: '.js',
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

function images() {
  return src(path.src.images).pipe(imagemin()).pipe(dest(path.build.images));
}

function clean() {
  return cleanD(path.clean);
}

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.images], images);
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images));
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;

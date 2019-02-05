const fs = require('fs');
const gulp = require('gulp');
const connect = require('gulp-connect');
const open = require('gulp-open');
const rename = require('gulp-rename');
const header = require('gulp-header');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('rollup');
const buble = require('rollup-plugin-buble');
const pkg = require('./package.json');

const paths = {
  root: './',
  build: 'build/',
  dist: 'dist/',
  demo: 'demo/',
  source: 'src/',
};

const date = {
  year: new Date().getFullYear(),
  month: ('January February March April May June July August September October November December').split(' ')[new Date().getMonth()],
  day: new Date().getDate(),
};

const t7 = {
  filename: 'template7',
  pkg,
  banner: [
    '/**',
    ` * Template7 ${pkg.version}`,
    ` * ${pkg.description}`,
    ' * ',
    ` * ${pkg.homepage}`,
    ' * ',
    ` * Copyright ${date.year}, ${pkg.author}`,
    ' * The iDangero.us',
    ' * http://www.idangero.us/',
    ' * ',
    ` * Licensed under ${pkg.license}`,
    ' * ',
    ` * Released on: ${date.month} ${date.day}, ${date.year}`,
    ' */',
    ''].join('\n'),
};

// Build
gulp.task('build', (cb) => {
  fs.copyFileSync('./src/template7.d.ts', './build/template7.d.ts');
  rollup.rollup({
    input: './src/template7.js',
    plugins: [buble()],
  }).then((bundle) => { // eslint-disable-line
    return bundle.write({
      strict: true,
      file: './build/template7.js',
      format: 'umd',
      name: 'Template7',
      sourcemap: true,
      sourcemapFile: './build/template7.js.map',
    });
  }).then(() => {
    cb();
  });
});

function umd(cb) {
  rollup.rollup({
    input: './src/template7.js',
    plugins: [buble()],
  }).then((bundle) => { // eslint-disable-line
    return bundle.write({
      strict: true,
      file: './dist/template7.js',
      format: 'umd',
      name: 'Template7',
      sourcemap: true,
      sourcemapFile: './dist/template7.js.map',
      banner: t7.banner,
    });
  }).then(() => {
    gulp.src('./dist/template7.js')
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(header(t7.banner))
      .pipe(rename('template7.min.js'))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/'))
      .on('end', () => {
        if (cb) cb();
      });
  });
}
function es(cb) {
  rollup.rollup({
    input: './src/template7.js',
  }).then((bundle) => { // eslint-disable-line
    return bundle.write({
      strict: true,
      file: './dist/template7.esm.js',
      format: 'es',
      name: 'Template7',
      banner: t7.banner,
    });
  }).then(() => {
    cb();
  });
}
// Dist
gulp.task('dist', (cb) => {
  let cbs = 0;
  fs.copyFileSync('./src/template7.d.ts', './dist/template7.d.ts');
  umd(() => {
    cbs += 1;
    if (cbs === 2) cb();
  });
  es(() => {
    cbs += 1;
    if (cbs === 2) cb();
  });
});

gulp.task('watch', () => {
  gulp.watch('./src/*.js', gulp.series(['build']));
});

gulp.task('connect', () => connect.server({
  root: [paths.root],
  livereload: true,
  port: '3000',
}));

gulp.task('open', () => gulp.src(`${paths.demo}index.html`).pipe(open({ uri: `http://localhost:3000/${paths.demo}index.html` })));

gulp.task('server', gulp.parallel(['watch', 'connect', 'open']));

gulp.task('default', gulp.series(['server']));

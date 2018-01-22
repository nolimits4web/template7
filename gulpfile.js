const gulp = require('gulp');
const connect = require('gulp-connect');
const open = require('gulp-open');
const rename = require('gulp-rename');
const header = require('gulp-header');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('rollup-stream');
const buble = require('rollup-plugin-buble');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const pkg = require('./package.json');

const paths = {
  root: './',
  build: 'build/',
  dist: 'dist/',
  demo: 'demo/',
  source: 'src/',
};
const t7 = {
  filename: 'template7',
  pkg,
  banner: [
    '/**',
    ' * Template7 <%= pkg.version %>',
    ' * <%= pkg.description %>',
    ' * ',
    ' * <%= pkg.homepage %>',
    ' * ',
    ' * Copyright <%= date.year %>, <%= pkg.author %>',
    ' * The iDangero.us',
    ' * http://www.idangero.us/',
    ' * ',
    ' * Licensed under <%= pkg.license %>',
    ' * ',
    ' * Released on: <%= date.month %> <%= date.day %>, <%= date.year %>',
    ' */',
    ''].join('\n'),
  date: {
    year: new Date().getFullYear(),
    month: ('January February March April May June July August September October November December').split(' ')[new Date().getMonth()],
    day: new Date().getDate(),
  },
};

  // Build
gulp.task('build', (cb) => {
  rollup({
    input: './src/template7.js',
    plugins: [buble()],
    format: 'umd',
    name: 'Template7',
    strict: true,
    sourcemap: true,
  })
    .pipe(source('template7.js', './src'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./build/'))
    .on('end', () => {
      cb();
    });
});

function umd(cb) {
  rollup({
    input: './src/template7.js',
    plugins: [buble()],
    format: 'umd',
    name: 'Template7',
    strict: true,
    sourcemap: true,
  })
    .pipe(source('template7.js', './src'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(header(t7.banner, {
      pkg: t7.pkg,
      date: t7.date,
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/'))
    .on('end', () => {
      gulp.src('./dist/template7.js')
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(header(t7.banner, {
          pkg: t7.pkg,
          date: t7.date,
        }))
        .pipe(rename('template7.min.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'))
        .on('end', () => {
          if (cb) cb();
        });
    });
}
function es(cb) {
  rollup({
    input: './src/template7.js',
    format: 'es',
    name: 'Template7',
    strict: true,
  })
    .pipe(source('template7.js', './src'))
    .pipe(buffer())
    .pipe(header(t7.banner, {
      pkg: t7.pkg,
      date: t7.date,
    }))
    .pipe(rename('template7.esm.js'))
    .pipe(gulp.dest('./dist/'))
    .on('end', () => {
      if (cb) cb();
    });
}
// Dist
gulp.task('dist', (cb) => {
  let cbs = 0;
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
  gulp.watch('./src/*.js', ['build']);
});

gulp.task('connect', () => connect.server({
  root: [paths.root],
  livereload: true,
  port: '3000',
}));

gulp.task('open', () => gulp.src(`${paths.demo}index.html`).pipe(open({ uri: `http://localhost:3000/${paths.demo}index.html` })));

gulp.task('server', ['watch', 'connect', 'open']);

gulp.task('default', ['server']);

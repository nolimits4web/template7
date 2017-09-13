(function(){
    'use strict';
    var gulp = require('gulp'),
        connect = require('gulp-connect'),
        open = require('gulp-open'),
        rename = require('gulp-rename'),
        header = require('gulp-header'),
        path = require('path'),
        uglify = require('gulp-uglify'),
        sourcemaps = require('gulp-sourcemaps'),
        rollup = require('rollup-stream'),
        buble = require('rollup-plugin-buble'),
        source = require('vinyl-source-stream'),
        buffer = require('vinyl-buffer'),
        paths = {
            root: './',
            build: 'build/',
            dist: 'dist/',
            demo: 'demo/',
            source: 'src/',
        },
        t7 = {
            filename: 'template7',
            pkg: require('./package.json'),
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
                ' * Licensed under <%= pkg.license.join(" & ") %>',
                ' * ',
                ' * Released on: <%= date.month %> <%= date.day %>, <%= date.year %>',
                ' */',
                ''].join('\n'),
            date: {
                year: new Date().getFullYear(),
                month: ('January February March April May June July August September October November December').split(' ')[new Date().getMonth()],
                day: new Date().getDate()
            }
        };

    // Build
    gulp.task('build', function (cb) {
        rollup({
            entry: './src/template7.js',
            plugins: [buble()],
            format: 'umd',
            moduleName: 'Template7',
            useStrict: true,
            sourceMap: true
        })
        .pipe(source('template7.js', './src'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./build/'))
        .on('end', function () {
            cb();
        });
    });
    function umd(cb) {
      rollup({
          entry: './src/template7.js',
          plugins: [buble()],
          format: 'umd',
          moduleName: 'Template7',
          useStrict: true,
          sourceMap: true
      })
      .pipe(source('template7.js', './src'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(header(t7.banner, {
          pkg: t7.pkg,
          date: t7.date
      }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/'))
      .on('end', function () {
          gulp.src('./dist/template7.js')
              .pipe(sourcemaps.init())
              .pipe(uglify())
              .pipe(header(t7.banner, {
                  pkg: t7.pkg,
                  date: t7.date
              }))
              .pipe(rename('template7.min.js'))
              .pipe(sourcemaps.write('./'))
              .pipe(gulp.dest('./dist/'))
              .on('end', function () {
                  if (cb) cb();
              });
      });
    }
    function es(cb) {
      rollup({
        entry: './src/template7.js',
        format: 'es',
        moduleName: 'Template7',
        useStrict: true,
      })
      .pipe(source('template7.js', './src'))
      .pipe(buffer())
      .pipe(header(t7.banner, {
        pkg: t7.pkg,
        date: t7.date
      }))
      .pipe(rename('template7.module.js'))
      .pipe(gulp.dest('./dist/'))
      .on('end', function () {
        if (cb) cb();
      });
    }
    // Dist
    gulp.task('dist', function (cb) {
      var cbs = 0;
      umd(function () {
        cbs += 1;
        if (cbs === 2) cb();
      });
      es(function () {
        cbs += 1;
        if (cbs === 2) cb();
      });
    });

    gulp.task('watch', function () {
        gulp.watch('./src/*.js', [ 'build' ]);
    });

    gulp.task('connect', function () {
        return connect.server({
            root: [ paths.root ],
            livereload: true,
            port:'3000'
        });
    });

    gulp.task('open', function () {
        return gulp.src(paths.demo + 'index.html').pipe(open({ uri: 'http://localhost:3000/' + paths.demo + 'index.html'}));
    });

    gulp.task('server', [ 'watch', 'connect', 'open' ]);

    gulp.task('default', [ 'server' ]);
})();

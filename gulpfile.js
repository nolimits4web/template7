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
        jshint = require('gulp-jshint'),
        stylish = require('jshint-stylish'),
        paths = {
            root: './',
            build: 'build/',
            dist: 'dist/',
            demo: 'demo/',
            source: 'src/',
        },
        t7 = {
            filename: 'template7',
            pkg: require('./bower.json'),
            banner: [
                '/**',
                ' * <%= pkg.name %> <%= pkg.version %>',
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

    
    
    gulp.task('build', function (cb) {
        gulp.src(paths.source + 'template7.js')
            .pipe(sourcemaps.init())
            .pipe(header(t7.banner, { pkg : t7.pkg, date: t7.date } ))
            .pipe(jshint())
            .pipe(jshint.reporter(stylish))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(paths.build))
            .pipe(connect.reload());
        cb();
    });

    gulp.task('dist', function () {
        gulp.src(paths.build + 'template7.js')
            .pipe(gulp.dest(paths.dist))
            .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(header(t7.banner, { pkg : t7.pkg, date: t7.date }))
            .pipe(rename(function(path) {
                path.basename = t7.filename + '.min';
            }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(paths.dist));
        gulp.src(paths.build + 'template7.js.map')
            .pipe(gulp.dest(paths.dist));
    });

    gulp.task('watch', function () {
        gulp.watch(paths.source + 'template7.js', [ 'build' ]);
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

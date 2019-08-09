'use strict';

const spawn        = require('child_process').spawn;
const fs           = require('fs');
const gulp         = require('gulp');
const execSync     = require('child_process').execSync;
const livereload   = require('gulp-livereload');
const stylus       = require('gulp-stylus');
const sourcemaps   = require('gulp-sourcemaps');
const rename       = require('gulp-rename');
const pump         = require('pump');
const autoprefixer = require('autoprefixer');
const postcss      = require('gulp-postcss');
const cssnano      = require('cssnano');
const inline_svg   = require('postcss-inline-svg');
//const gulpTsLint   = require('gulp-tslint');
//const tslint       = require('tslint');

let ts_sources = ['src/**/*.ts', 'src/**/*.tsx'];

gulp.task('watch_dist_js', watch_dist_js);
gulp.task('watch_styl', watch_styl);
gulp.task('build_styl', build_styl);
gulp.task('min_styl', min_styl);
gulp.task('livereload-server', livereload_server);
gulp.task('background_webpack', background_webpack);
//gulp.task('background_webpack_server', background_webpack_server);
//gulp.task('watch_tslint', watch_tslint);
//gulp.task('tslint', lint);
gulp.task('default', 
    gulp.parallel(
        "livereload-server", 
        "background_webpack", 
        //"background_webpack_server",  /* done by a different tmux window now */
        "build_styl", 
        "watch_styl", 
        "watch_dist_js", 
        //"watch_tslint"
    )
);


function reload(done) {
    setTimeout(livereload.reload, 0.5);
    //livereload.reload();
    done();
}
function watch_dist_js(done) { 
    gulp.watch(['dist/client.js'], reload);
    done(); 
}
function watch_styl(done) { 
    gulp.watch(['src/**/*.styl', 'src/*.styl'], build_styl);
    done(); 
}
function livereload_server(done) { 
    livereload.listen(35708);
    done(); 
}
/*
function watch_tslint(done) { 
    gulp.watch(ts_sources, lint);
    done();
};
*/

/*
let lint_debounce = null;
function lint(done) {
    if (lint_debounce) {
        done();
        return;
    }

    lint_debounce = setTimeout(()=>{
        lint_debounce = null;
        gulp.src(ts_sources, {base: '.'})
        .pipe(gulpTsLint({
            formatter: "prose"
        }))
        .pipe(gulpTsLint.report({
            emitError: false,
            reportLimit: 0,
            summarizeFailureOutput: false
        }))
    }, 50)
    done();
}
*/

function build_styl(done) {
    pump([gulp.src('./src/tarkovarmory.styl'),
          sourcemaps.init(),
          stylus({
              compress: false,
              'include css': true,
          }),
          postcss([
              autoprefixer({
                  browsers: ["> 1%", "last 2 versions", "Firefox ESR"],
                  cascade: false
              }),
              inline_svg(),
              //cssnano(),
          ]),
          sourcemaps.write('.'),
          gulp.dest('./dist'),
    ],
      (err) => {
          if (err) {
              console.error(err);
          } else {
              livereload.reload('tarkovarmory.css');
          }
          done();
      }
    );
}

function min_styl(done) {
    console.info(`Building tarkovarmory.min.css`);
    pump([gulp.src('./src/tarkovarmory.styl'),
          sourcemaps.init(),
          stylus({
              compress: false,
              'include css': true,
          }),
          postcss([
              autoprefixer({
                  browsers: ["> 1%", "last 2 versions", "Firefox ESR"],
                  cascade: false
              }),
              inline_svg(),
              cssnano(),
          ]),
          rename({suffix: '.min'}),
          sourcemaps.write('.'),
          gulp.dest('./dist'),
    ],
      (err) => {
          if (err) {
              console.error(err);
          } else {
              livereload.reload('tarkovarmory.css');
          }
          done();
      }
    );
}


function background_webpack(done) {
    function spawn_webpack() {
        let env = process.env;
        let webpack = spawn('node', ['node_modules/webpack/bin/webpack.js', '--watch', '--progress', '--colors'])

        webpack.stdout.on('data', o => process.stdout.write(o))
        webpack.stderr.on('data', o => process.stderr.write(o))
        webpack.on('exit', spawn_webpack);
    }
    spawn_webpack();

    done()
}

/*
function background_webpack_server(done) {
    function spawn_webpack() {
        let env = process.env;
        let webpack = spawn('node', ['node_modules/webpack/bin/webpack.js', '--watch', '--progress', '--colors', '--config', 'webpack-server.config.js'])

        webpack.stdout.on('data', o => process.stdout.write(o))
        webpack.stderr.on('data', o => process.stderr.write(o))
        webpack.on('exit', spawn_webpack);
    }
    spawn_webpack();

    done()
}
*/

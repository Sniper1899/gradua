const { src, dest, parallel, series, watch } = require('gulp');

const browserSync  = require('browser-sync').create();
const concat       = require('gulp-concat');
const uglify       = require('gulp-uglify-es').default;
const sass         = require('gulp-sass')(require('sass'));
const bourbon      = require('node-bourbon');
const rename       = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS     = require('gulp-clean-css');
const del          = require('del');
const cache        = require('gulp-cache');

// browserSync rules
function browsersync() {
  browserSync.init({
    server: { baseDir: 'app/' },
    notify: true,
    online: true
  })
}

// expanded CSS compilation
function styles() {
  return src('app/sass/**/*.sass')
  .pipe(sass({
    includePaths: bourbon.includePaths,
    outputStyle: 'expanded'
  }))
  .pipe(autoprefixer({
    overrideBrowserslist: [
      'last 15 versions',
      'ie >= 7',
      'Firefox < 20'
    ],
    grid: true
  }))
  .pipe(dest('app/css/'))
  .pipe(browserSync.reload({stream: true}))
}

// minificated CSS compilation to source-files folder
function cssmin() {
  return src('app/sass/**/*.sass')
  .pipe(sass({ includePaths: bourbon.includePaths }))
  .pipe(rename({ suffix: '.min', prefix : '' }))
  .pipe(autoprefixer({
    overrideBrowserslist: [
      'last 15 versions',
      'ie >= 7',
      'Firefox < 20'
    ],
    grid: true
  }))
  .pipe(cleanCSS())
  .pipe(dest('dist/source-files/ramio-css-min-files/'))
}

// expanded CSS compilation to source-files folder
function cssexp() {
  return src('app/sass/**/*.sass')
  .pipe(sass({
    includePaths: bourbon.includePaths,
    outputStyle: 'expanded'
  }))
  .pipe(autoprefixer({
    overrideBrowserslist: [
      'last 15 versions',
      'ie >= 7',
      'Firefox < 20'
    ],
    grid: true
  }))
  .pipe(dest('dist/source-files/ramio-css-files/'))
}

// HTML build
function html() {
  return src('app/*.html')
  .pipe(dest('dist/'))
}

// JS libs minification
function libs() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'assets/modernizr/modernizr.js',
    'node_modules/jquery.transit/jquery.transit.js',
    'node_modules/jquery-mousewheel/jquery.mousewheel.js',
    'node_modules/kbw-countdown/dist/js/jquery.plugin.min.js',
    'node_modules/kbw-countdown/dist/js/jquery.countdown.min.js',
    'node_modules/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.js',
    'node_modules/vegas/dist/vegas.js',
    'assets/jquery.mb.YTPlayer-master/dist/jquery.mb.YTPlayer.min.js',
    'node_modules/particles.js/particles.js',
    'node_modules/photoswipe/dist/photoswipe.js',
    'node_modules/photoswipe/dist/photoswipe-ui-default.js',
    'node_modules/ajaxchimp/jquery.ajaxchimp.js',
    'assets/ramio-app.js'
  ])
  .pipe(concat('libs.min.js'))
  .pipe(uglify().on('error', console.error))
  .pipe(uglify())
  .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
  .pipe(dest('app/js/'))
  .pipe(browserSync.stream())
}

// expanded JS libs compilation to source-files folder
function libsexp() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'assets/modernizr/modernizr.js',
    'node_modules/jquery.transit/jquery.transit.js',
    'node_modules/jquery-mousewheel/jquery.mousewheel.js',
    'node_modules/kbw-countdown/dist/js/jquery.plugin.min.js',
    'node_modules/kbw-countdown/dist/js/jquery.countdown.min.js',
    'node_modules/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.js',
    'node_modules/vegas/dist/vegas.js',
    'assets/jquery.mb.YTPlayer-master/dist/jquery.mb.YTPlayer.min.js',
    'node_modules/particles.js/particles.js',
    'node_modules/photoswipe/dist/photoswipe.js',
    'node_modules/photoswipe/dist/photoswipe-ui-default.js',
    'node_modules/ajaxchimp/jquery.ajaxchimp.js',
    'assets/ramio-app.js'
  ])
  .pipe(concat('libs.js'))
  .pipe(dest('dist/source-files/ramio-js-files/'))
}

// clean dist folder
function cleandist() {
  return del(['dist/**'])
}

// files copy to dist
function buildcopy() {
  return src([
    'app/css/**/*.css',
    'app/**/*.html',
    'app/js/**/*.js',
    'app/fonts/**/*',
    'app/video/**/*',
    'app/img/**/*',
    'app/.htaccess',
    'app/mail.php'
  ], { base: 'app', encoding: false })
  .pipe(dest('dist'))
}

// app.js copy to dist
function buildalljs() {
  return src([
    'assets/ramio-app.js',
    'app/js/demo/demo.js',
    'app/js/ramio-custom.js',
    'app/js/gallery-init.js',
    'app/js/maps/*.js'
  ])
  .pipe(dest('dist/source-files/ramio-js-files/'))
}

// files watch
function startwatch() {
  watch('app/**/*.html').on('change', browserSync.reload);
  watch([ 'app/**/*.js', '!app/**/*.min.js' ], libs);
  watch([ 'app/sass/**/*.sass' ], styles);
}

// clear cache
function clearcache() {
  return cache.clearAll();
}

// all functions export
exports.browsersync   = browsersync;
exports.libs          = libs;
exports.libsexp       = libsexp;
exports.styles        = styles;
exports.cssmin        = cssmin;
exports.cssexp        = cssexp;
exports.html          = html;
exports.clearcache    = clearcache;

// build function
exports.build         = series(cleandist, styles, cssmin, cssexp, html, libs, libsexp, buildcopy, buildalljs);

// default function (gulp)
exports.default       = parallel(styles, libs, browsersync, startwatch);

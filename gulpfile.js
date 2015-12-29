// Set 'src' & 'site' folders as variables. 
var src = './_src/'
var site = './_site/'

// Load in Gulp requirements.
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var nano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var browserSync = require('browser-sync');
var clean = require('gulp-clean');
var cp = require('child_process');

// Variable to store messages, such as additional browserSync notifications.
var messages = {
  jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * SASS
 * - Compile .scss files in '_src/_scss/'.
 * - Prefix resulting css file with autoprefixer.
 * - Compress css file using cssnano.
 * - Inject compiled css into '_site/assets/css' and update browserSync stream.
 * - Inject compiled css into '_src/assets/css' for future Jekyll builds.
 */
gulp.task('sass', function(){
  return gulp.src(src + '_scss/main.scss')
    
    .pipe(sass())
    .pipe(gulp.dest(src + 'assets/css'))
    
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    
    .pipe(sourcemaps.init())
    .pipe(nano())
    .pipe(sourcemaps.write('.'))
    
    .pipe(gulp.dest(site + 'assets/css'))
    .pipe(browserSync.stream())
    .pipe(gulp.dest(src + 'assets/css'))
});

/**
 * JavaScript
 * - Lint user created js ('_src/_scripts/') using jshint, note: not linting vendor scripts.
 * - Concatenate js files into _src/assets/js and update browserSync stream.
 * - Minify '_src/assets/js/global.js' -- only used during 'gulp build'.
 */
gulp.task('lint', function() {
  return gulp.src(src + '_scripts/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
});

gulp.task('scripts', function() {
  return gulp.src([
      'bower_components/jquery/site/jquery.js',
      'bower_components/modernizr/modernizr.js',
      src +'_scripts/vendor/**/*.js',
      src +'_scripts/main.js'
    ])
    .pipe(concat('global.js'))
    .pipe(gulp.dest(site + 'assets/js'))
    .pipe(browserSync.stream())
    .pipe(gulp.dest(src + 'assets/js'))
});

gulp.task('uglify-js', ['scripts'], function() {
  return gulp.src(src + 'assets/js/global.js')
    .pipe(uglify())
    .pipe(gulp.dest(src + 'assets/js'))
});

/**
 * Image Minification
 * - Compress images inside '_src/_images/' with gulp-imagemin.
 * - Inject compressed images into '_site/assets/img' and update browserSync stream.
 * - Inject compressed images into '_src/assets/img' for future Jekyll builds. 
 */
gulp.task('images', function() {
  return gulp.src(src + '_images/**/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(site + 'assets/img'))
    .pipe(browserSync.stream())
    .pipe(gulp.dest(src + 'assets/img'))
});

/**
 * Favicons
 * - Note: Favicons are only processed during 'gulp-build', to avoid cluttering the 'src' folder. Favicons copied into '_src/' are copied to '_site/' during 'jekyll-build'
 * - Compress .png favicons inside '_src/_favicons/' with gulp-imagemin.
 * - Inject compressed .png favicons into '_src/'.
 * - Copy favicon.ico into '_src/'.
 */
gulp.task('favicons', ['favicon-copy'], function() {
  return gulp.src(src + '_favicons/*.png')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(src))
});

gulp.task('favicon-copy', function() {
  return gulp.src(src + '_favicons/*.ico')
    .pipe(gulp.dest(src))
});

/**
 * Jekyll Build
 * - Runs the required Jekyll Build commands.
 */
gulp.task('jekyll-build', function (done) {
  browserSync.notify(messages.jekyllBuild);
  return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
    .on('close', done);
});

/**
 * Jekyll Rebuild & Reload
 * - Rebuilds Jekyll and performs a full browser reload.
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
  browserSync.reload();
});

/**
 * BrowserSync
 * - BrowserSync task runs under 'gulp default'.
 * - Runs sass, scripts, images and jekyll-rebuild before serving from 'site/'.
 */
gulp.task('browserSync', ['sass', 'scripts', 'images', 'jekyll-rebuild'], function() {
  browserSync({
    server: {
      baseDir: site
    },
  })
  browserSync.reload();
});

/**
 * Watch
 * - Watch for changes to .scss, .js, image files and Jekyll files, then run the appropriate tasks.
 */
gulp.task('watch', function(){
  gulp.watch(src + '/_scss/**/*.scss', ['sass']);
  gulp.watch(src + '/_scripts/**/*.js', ['lint', 'scripts']);
  gulp.watch(src + '/_images/**/*', ['images']);
  gulp.watch([src + '**/*.html', src + '**/*.md', src + '**/*.markdown', src + '**/*.xml', src + '**/*.yml'], ['jekyll-rebuild']);
});

/**
 * Clean
 * - After running 'gulp build' the '_src/' folder is littered with compiled files.
 * - Running 'gulp clean' deletes these compiled files.
 * - It is a good idea to run this before using 'gulp default' again.
 */
gulp.task('clean', function () {
  return gulp.src([
      src + 'assets/',
      src + '/*.png',
      src + '/favicon.ico',
    ], {read: false})
    .pipe(clean());
});

/**
 * Default Gulp Task
 */
gulp.task('default', ['browserSync', 'watch']);

/**
 * Build Gulp Task
 * - Processes favicons.
 * - Processes images.
 * - Processes sass.
 * - Processes js, including minification.
 * - Runs Jekyll build process.
 */
gulp.task('build', ['favicons', 'images', 'sass', 'scripts', 'uglify-js'], function (done) {
  return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
    .on('close', done);
});
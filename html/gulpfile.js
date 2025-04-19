"use strict";

// Load plugins
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const concat = require("gulp-concat");
const del = require("del");
const gulp = require("gulp");
const header = require("gulp-header");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require('gulp-sass')(require('sass'));
const uglify = require("gulp-uglify");
const googleWebfonts = require("gulp-google-webfonts");

const fs = require('fs');
const path = require('path');

// Load package.json for banner
const pkg = require('./package.json');

// Set the banner content
const banner = ['/*!\n',
 ' * aario.info - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
 ' * Copyright 2025-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
 ' * Licensed under <%= pkg.license %> (https://github.com/StartBootstrap/<%= pkg.name %>/blob/master/LICENSE)\n',
 ' */\n',
 '\n'
].join('');

// --- Configuration ---
const paths = {
 templates: {
  src: './templates/**/*.html',
  dest: './js/build/',
  generatedFile: '_templates.js'
 },
 js: {
  src: './js/*.js',
  dest: './js/build/',
  minifiedDest: '../app/src/main/assets/',
  concatFile: 'scripts.js',
  minSuffix: '.min'
 },
 etc: {
   src: [
     './index.html',
     './logo.png',
   ],
   dest: '../app/src/main/assets/'
 },
 fonts: {
   src: [
     './fonts/*',
     './vendor/fontawesome-free/webfonts/*',
   ],
   dest: '../app/src/main/assets/fonts'
 },
 // --- Fonts Configuration ---
 googleFonts: {
   src: './fonts.list',
   dest: './', // Destination for gulp.dest() after googleWebfonts runs
   fontDir: 'fonts/', // Fonts will go to ./fonts/ relative to dest
   cssDir: 'css/',    // CSS will go to ./css/ relative to dest
   cssFilename: 'google-fonts.css',
   cssPath: '../fonts/' // <--- Correct relative path from CSS file to font directory
 }
 // --- End Fonts Configuration ---
};
const templatesDir = path.join(__dirname, 'templates');
const generatedTemplatesJsPath = path.join(__dirname, paths.templates.dest, paths.templates.generatedFile);
const generatedFontCssPath = path.join(__dirname, paths.googleFonts.cssDir, paths.googleFonts.cssFilename); // Path to generated font CSS

// BrowserSync
function browserSync(done) {
 browsersync.init({
  server: {
   baseDir: "./"
  },
  port: 3000,
  open: false,
 });
 done();
}

// BrowserSync reload
function browserSyncReload(done) {
 browsersync.reload();
 done();
}

// Clean vendor, built assets, and fonts
function clean() {
 return del([
  "./vendor/",
  "./css/*.css",
  "./js/build/*",
  "./fonts/"
 ]);
}

// Google Fonts Task - CORRECTED
function googlefonts() {
  const fontListPath = paths.googleFonts.src;
  if (!fs.existsSync(fontListPath)) {
    const fontContent = 'Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i';
    fs.writeFileSync(fontListPath, fontContent);
    console.log(`Created ${fontListPath} with default Nunito font.`);
  }

  return gulp.src(paths.googleFonts.src)
    .pipe(plumber()) // Add plumber for error handling
    .pipe(googleWebfonts({
      fontsDir: paths.googleFonts.fontDir, // Relative to dest
      cssFilename: paths.googleFonts.cssFilename,
      // formats: ['woff2', 'woff'] // Optionally specify formats
    }))
    .on('error', function(err) { // More specific error logging
      console.error('Error in googlefonts task:', err.toString());
      this.emit('end'); // Prevent Gulp from stopping on error
    })
    .pipe(gulp.dest(paths.googleFonts.dest)); // Output to root directory './'
}


// Bring third party dependencies from node_modules into vendor directory
function modules() {
 // Bootstrap JS
 var bootstrapJS = gulp.src('./node_modules/bootstrap/dist/js/*')
  .pipe(gulp.dest('./vendor/bootstrap/js'));
 // Bootstrap SCSS
 var bootstrapSCSS = gulp.src('./node_modules/bootstrap/scss/**/*')
  .pipe(gulp.dest('./vendor/bootstrap/scss'));
 // ChartJS
 var chartJS = gulp.src('./node_modules/chart.js/dist/*.js')
  .pipe(gulp.dest('./vendor/chart.js'));
 // dataTables
 var dataTables = gulp.src([
   './node_modules/datatables.net/js/*.js',
   './node_modules/datatables.net-bs4/js/*.js',
   './node_modules/datatables.net-bs4/css/*.css'
   ])
  .pipe(gulp.dest('./vendor/datatables'));
 // Font Awesome
 var fontAwesome = gulp.src('./node_modules/@fortawesome/**/*')
  .pipe(gulp.dest('./vendor'));
 // jQuery Easing
 var jqueryEasing = gulp.src('./node_modules/jquery.easing/*.js')
  .pipe(gulp.dest('./vendor/jquery-easing'));
 // jQuery
 var jquery = gulp.src([
   './node_modules/jquery/dist/*',
   '!./node_modules/jquery/dist/core.js'
   ])
  .pipe(gulp.dest('./vendor/jquery'));
 // EasyMDE
 var easymde = gulp.src([
   './node_modules/easymde/dist/*'
   ])
  .pipe(gulp.dest('./vendor/easymde'));
 // Hammer.js
 var hammerJS = gulp.src('./node_modules/hammerjs/hammer.min.js')
  .pipe(gulp.dest('./vendor/hammerjs'));
 // Fuse.js
 var fuseJS = gulp.src('./node_modules/fuse.js/dist/fuse.min.js')
  .pipe(gulp.dest('./vendor/fuse.js'));

 return merge(bootstrapJS, bootstrapSCSS, chartJS, dataTables, fontAwesome, jquery, jqueryEasing, easymde, hammerJS, fuseJS);
}

// CSS task - Includes generated font CSS
function css() {
 // Process SCSS separately first
 var scssStream = gulp.src("./scss/styles.scss") // Process only the main SCSS file
  .pipe(plumber())
  .pipe(sass({
   outputStyle: "expanded",
   includePaths: "./node_modules",
  }))
  .on("error", sass.logError)
  .pipe(autoprefixer({
   cascade: false
  }));
 // Stream for the generated google fonts css
 var fontCssStream = gulp.src(generatedFontCssPath, { allowEmpty: true });

 // Merge the two streams, process together
 return merge(fontCssStream, scssStream) // Font CSS first, then compiled SCSS
  .pipe(plumber())
  .pipe(concat('styles.css')) // Concatenate font CSS and compiled SCSS
  .pipe(header(banner, {
   pkg: pkg
  }))
  .pipe(gulp.dest("./css")) // Output the non-minified combined CSS
  .pipe(rename({
   suffix: ".min"
  }))
  .pipe(cleanCSS())
  .pipe(gulp.dest("../app/src/main/assets/")) // Output the minified combined CSS
  .pipe(browsersync.stream());
}


function generateTemplatesJS(done) {
 // (generateTemplatesJS function remains unchanged)
  if (!fs.existsSync(templatesDir)) {
  console.warn(`Templates directory not found: ${templatesDir}. Skipping template generation.`);
  if (!fs.existsSync(path.dirname(generatedTemplatesJsPath))) {
   fs.mkdirSync(path.dirname(generatedTemplatesJsPath), { recursive: true });
  }
  fs.writeFileSync(generatedTemplatesJsPath, 'window.templates = {};\n');
  return done();
 }
 let templatesObject = 'window.templates = {\n';
 const files = fs.readdirSync(templatesDir);
 files.forEach(file => {
  const filePath = path.join(templatesDir, file);
  const fileStat = fs.statSync(filePath);
  if (fileStat.isFile() && path.extname(file).toLowerCase() === '.html') {
   const baseName = path.basename(file, '.html');
   const content = fs.readFileSync(filePath, 'utf8');
   const escapedContent = content
          .replace(/\\/g, '\\\\')
          .replace(/`/g, '\\`')
          .replace(/\$\{/g, '\\${');
   templatesObject += `  "${baseName}": \`${escapedContent}\`,\n`;
  }
 });
 if (templatesObject.endsWith(',\n')) {
  templatesObject = templatesObject.slice(0, -2) + '\n';
 }
 templatesObject += '};\n';
 if (!fs.existsSync(paths.templates.dest)) {
   fs.mkdirSync(paths.templates.dest, { recursive: true });
 }
 fs.writeFileSync(generatedTemplatesJsPath, templatesObject);
 console.log(`Generated ${paths.templates.generatedFile} from HTML templates.`);
 done();
}


// JS task - (remains unchanged from previous version)
function js() {
 return gulp
  .src([
    './vendor/jquery/jquery.min.js',
    './vendor/bootstrap/js/bootstrap.bundle.min.js',
    './vendor/jquery-easing/jquery.easing.min.js',
    './vendor/easymde/easymde.min.js',
    './vendor/hammerjs/hammer.min.js',
    './vendor/fuse.js/fuse.min.js',
    generatedTemplatesJsPath,
    paths.js.src,
   ],
   { allowEmpty: true }
  )
  .pipe(plumber())
  .pipe(concat(paths.js.concatFile))
  .pipe(header(banner, {
   pkg: pkg
  }))
  .pipe(gulp.dest(paths.js.dest))
  .pipe(uglify())
  .pipe(rename({
   suffix: paths.js.minSuffix
  }))
  .pipe(gulp.dest(paths.js.minifiedDest))
  .pipe(browsersync.stream());
}

function etc() {
  return gulp
    .src(paths.etc.src)
    .pipe(gulp.dest(paths.etc.dest))
}

function fonts() {
  return gulp
    .src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dest))
}

// Watch files - Watches generated font CSS
function watchFiles() {
 gulp.watch("./scss/**/*.scss", css);
 // Watch the generated font CSS file as well, trigger css task if it changes (e.g., after googlefonts runs)
 gulp.watch(generatedFontCssPath, css);
 gulp.watch([paths.js.src, `!${generatedTemplatesJsPath}`], js);
 gulp.watch(paths.templates.src, gulp.series(generateTemplatesJS, js));
 // Watch the font list file, regenerate fonts and then css if it changes
 gulp.watch(paths.googleFonts.src, gulp.series(googlefonts, css));
 gulp.watch("./**/*.html", browserSyncReload);
}

// Define complex tasks - Ensure googlefonts runs before css
const vendor = gulp.series(clean, googlefonts, modules);
const build = gulp.series(vendor, generateTemplatesJS, gulp.parallel(css, js, etc, fonts)); // css now depends on googlefonts completing first
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

// Export tasks
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;
exports.generateTemplatesJS = generateTemplatesJS;
exports.googlefonts = googlefonts;

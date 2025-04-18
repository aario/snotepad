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
   src: './templates/**/*.html', // Source HTML templates
   dest: './js/build/',          // Destination for the generated JS file
   generatedFile: '_templates.js' // Name of the generated file
 },
 js: {
   src: './js/*.js',             // Source *custom* JS files (excluding generated)
   dest: './js/build/',          // Destination for final JS files
   concatFile: 'scripts.js',     // Name of the concatenated file
   minSuffix: '.min'             // Suffix for minified file
 }
};
const templatesDir = path.join(__dirname, 'templates'); // Absolute path to templates dir
const generatedTemplatesJsPath = path.join(__dirname, paths.templates.dest, paths.templates.generatedFile);

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

// Clean vendor and built assets
function clean() {
 return del([
   "./vendor/",
   "./css/*.min.*",
   "./js/build/*"
 ]);
}

// Bring third party dependencies from node_modules into vendor directory - MODIFIED
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
 // *** START Hammer.js ADDITION ***
 var hammerJS = gulp.src('./node_modules/hammerjs/hammer.min.js') // Select the minified file
    .pipe(gulp.dest('./vendor/hammerjs')); // Copy it to vendor/hammerjs/
 // *** END Hammer.js ADDITION ***

 // *** Add hammerJS to the merge stream ***
 return merge(bootstrapJS, bootstrapSCSS, chartJS, dataTables, fontAwesome, jquery, jqueryEasing, easymde, hammerJS); // Added hammerJS here
}

// CSS task
function css() {
 return gulp
   .src("./scss/**/*.scss")
   .pipe(plumber())
   .pipe(sass({
     outputStyle: "expanded",
     includePaths: "./node_modules",
   }))
   .on("error", sass.logError)
   .pipe(autoprefixer({
     cascade: false
   }))
   .pipe(header(banner, {
     pkg: pkg
   }))
   .pipe(gulp.dest("./css"))
   .pipe(rename({
     suffix: ".min"
   }))
   .pipe(cleanCSS())
   .pipe(gulp.dest("./css"))
   .pipe(browsersync.stream());
}

function generateTemplatesJS(done) {
 // (generateTemplatesJS function remains unchanged)
  // Check if templates directory exists
 if (!fs.existsSync(templatesDir)) {
   console.warn(`Templates directory not found: ${templatesDir}. Skipping template generation.`);
   // Create an empty file to avoid errors in the 'js' task if it expects the file
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

   // Process only files ending with .html
   if (fileStat.isFile() && path.extname(file).toLowerCase() === '.html') {
     const baseName = path.basename(file, '.html');
     // Read file content
     const content = fs.readFileSync(filePath, 'utf8');
     // Escape backticks, backslashes, and ${} for template literal safety
     const escapedContent = content
                       .replace(/\\/g, '\\\\') // Escape backslashes
                       .replace(/`/g, '\\`')  // Escape backticks
                       .replace(/\$\{/g, '\\${'); // Escape literal ${
     // Add to object string, using template literals (`) for content
     templatesObject += `  "${baseName}": \`${escapedContent}\`,\n`;
   }
 });

 // Remove trailing comma if any templates were added
 if (templatesObject.endsWith(',\n')) {
   templatesObject = templatesObject.slice(0, -2) + '\n';
 }

 templatesObject += '};\n'; // Close the object

 // Ensure destination directory exists
  if (!fs.existsSync(paths.templates.dest)) {
     fs.mkdirSync(paths.templates.dest, { recursive: true });
  }

 // Write the generated JS file
 fs.writeFileSync(generatedTemplatesJsPath, templatesObject);
 console.log(`Generated ${paths.templates.generatedFile} from HTML templates.`);
 done();
}


// JS task - MODIFIED
function js() {
 return gulp
   // --- Source vendor files, generated templates, and then other JS files ---
   .src([
       // Vendor files first (ensure order is correct for dependencies)
       './vendor/jquery/jquery.min.js',
       './vendor/bootstrap/js/bootstrap.bundle.min.js',
       './vendor/jquery-easing/jquery.easing.min.js',
       './vendor/easymde/easymde.min.js',
       // *** START Hammer.js ADDITION ***
       './vendor/hammerjs/hammer.min.js', // Include the copied Hammer.js file
       // *** END Hammer.js ADDITION ***

       // Then the generated templates file
       generatedTemplatesJsPath,

       // Then your custom JS files
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
   .pipe(gulp.dest(paths.js.dest))
   .pipe(browsersync.stream());
}

// Watch files (remains unchanged)
function watchFiles() {
 gulp.watch("./scss/**/*.scss", css);
 gulp.watch([paths.js.src, `!${generatedTemplatesJsPath}`], js);
 gulp.watch(paths.templates.src, gulp.series(generateTemplatesJS, js));
 gulp.watch("./**/*.html", browserSyncReload);
}

// Define complex tasks (remains unchanged)
const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, generateTemplatesJS, gulp.parallel(css, js));
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

// Export tasks (remains unchanged)
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;
exports.generateTemplatesJS = generateTemplatesJS;

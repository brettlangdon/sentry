"use strict";

var gulp = require("gulp"),
    gp_changed = require("gulp-changed"),
    gp_clean = require("gulp-clean"),
    gp_concat = require("gulp-concat"),
    gp_filesize = require("gulp-filesize"),
    gp_less = require("gulp-less"),
    gp_rename = require("gulp-rename"),
    gp_sourcemaps = require("gulp-sourcemaps"),
    gp_uglify = require("gulp-uglify"),
    gp_util = require("gulp-util");

var path = require("path");

var staticPrefix = "src/sentry/static/sentry",
    distPath = staticPrefix + "/dist";

var jsDistros = {
  "app": [
    file("scripts/core.js"),
    file("scripts/models.js"),
    file("scripts/templates.js"),
    file("scripts/utils.js"),
    file("scripts/collections.js"),
    file("scripts/charts.js"),
    file("scripts/views.js"),
    file("scripts/app.js")
  ],

  "app-legacy": [
    file("scripts/sentry.core.js"),
    file("scripts/sentry.charts.js"),
    file("scripts/sentry.stream.js"),
  ],

  "vendor-jquery": [
    vendorFile("jquery/dist/jquery.min.js"),
    file("scripts/lib/jquery.migrate.js"),

    vendorFile("jquery-flot/jquery.flot.js"),
    vendorFile("jquery-flot/jquery.flot.resize.js"),
    vendorFile("jquery-flot/jquery.flot.stack.js"),
    vendorFile("jquery-flot/jquery.flot.time.js"),
    file("scripts/lib/jquery.flot.dashes.js"),
    file("scripts/lib/jquery.flot.tooltip.js"),

    file("scripts/lib/jquery.animate-colors.js"),
    file("scripts/lib/jquery.clippy.min.js"),
    file("scripts/lib/jquery.cookie.js")
  ],

  "vendor-backbone": [
    file("scripts/lib/json2.js"),
    file("scripts/lib/underscore.js"),
    file("scripts/lib/backbone.js")
  ],

  "vendor-bootstrap": [
    vendorFile("bootstrap/js/bootstrap-transition.js"),
    vendorFile("bootstrap/js/bootstrap-alert.js"),
    vendorFile("bootstrap/js/bootstrap-button.js"),
    vendorFile("bootstrap/js/bootstrap-carousel.js"),
    vendorFile("bootstrap/js/bootstrap-collapse.js"),
    vendorFile("bootstrap/js/bootstrap-dropdown.js"),
    vendorFile("bootstrap/js/bootstrap-modal.js"),
    vendorFile("bootstrap/js/bootstrap-tooltip.js"),
    vendorFile("bootstrap/js/bootstrap-popover.js"),
    vendorFile("bootstrap/js/bootstrap-scrollspy.js"),
    vendorFile("bootstrap/js/bootstrap-tab.js"),
    vendorFile("bootstrap/js/bootstrap-typeahead.js"),
    vendorFile("bootstrap/js/bootstrap-affix.js"),
    file("scripts/lib/bootstrap-datepicker.js")
  ],

  "vendor-misc": [
    vendorFile("moment/min/moment.min.js"),
    vendorFile("simple-slider/js/simple-slider.min.js"),
    file("scripts/lib/select2/select2.js")
  ],

  "raven": [
    vendorFile("raven-js/dist/raven.min.js")
  ]
}

function file(name) {
  return path.join(__dirname, staticPrefix, name);
}

function vendorFile(name) {
  return path.join(__dirname, staticPrefix, "vendor", name);
}

function buildJsCompileTask(name, fileList) {
  // TODO(dcramer): sourcemaps do not have the correct path to the
  // originaly files
  return gulp.src(jsDistros[distroName])
    .pipe(gp_sourcemaps.init())
    .pipe(gp_concat(distroName + ".js"))
    .pipe(gulp.dest(distPath))
    .pipe(gp_filesize())
    .pipe(gp_uglify())
    .pipe(gp_rename(distroName + ".min.js"))
    .pipe(gp_filesize())
    .pipe(gp_sourcemaps.write("./", {
      includeContent: false
    }))
    .pipe(gulp.dest(distPath))
    .on("error", gp_util.log);
}

gulp.task("clean", function () {
  return gulp.src(distPath, {read: false})
    .pipe(gp_clean());
});

gulp.task("dist:css", function () {
  return gulp.src(file("less/sentry.less"))
    .pipe(gp_sourcemaps.init())
    .pipe(gp_less({
        paths: [vendorFile("bootstrap/less")]
    }))
    .pipe(gp_concat("sentry.css"))
    .pipe(gp_filesize())
    .pipe(gp_sourcemaps.write("./", {
      includeContent: false
    }))
    .pipe(gulp.dest(distPath))
    .on("error", gp_util.log);
});

// create a gulp task for each JS distro
var jsDistroNames = [], jsTask;
for (var distroName in jsDistros) {
  jsTask = buildJsCompileTask(distroName, jsDistros[distroName]);
  gulp.task("dist:js:" + distroName, function(){
    jsTask;
  });
  jsDistroNames.push(distroName);
}

gulp.task("dist:js", jsDistroNames.map(function(n) { return "dist:js:" + n; }));

gulp.task("dist", ["dist:js", "dist:css"]);

gulp.task("watch:css", function(){
  gulp.watch(file("less/sentry.less"), ["dist:css"]);
});

gulp.task("watch:js:vendor-misc", function(){
  var files = [
    vendorFile("moment/min/moment.min.js"),
    vendorFile("simple-slider/js/simple-slider.min.js"),
    file("scripts/lib/select2/select2.js")
  ];

  gulp.watch(files, ["dist:js:vendor-misc"]);
});

gulp.task("watch:js", ["watch:js:vendor-misc"]);

gulp.task("watch", ["watch:js", "watch:css"]);

gulp.task("default", ["dist", "watch"]);

// // Lint JavaScript
// gulp.task("jshint", function () {
//   return gulp.src(staticPrefix + "/**/*.js")
//     .pipe(reload({stream: true, once: true}))
//     .pipe($.jshint())
//     .pipe($.jshint.reporter("jshint-stylish"))
//     .pipe($.if(!browserSync.active, $.jshint.reporter("fail")));
// });

// // Optimize Images
// gulp.task("images", function () {
//   return gulp.src(staticPrefix + "images/**/*")
//     .pipe($.cache($.imagemin({
//       progressive: true,
//       interlaced: true
//     })))
//     .pipe(gulp.dest("dist/images"))
//     .pipe($.size({title: "images"}));
// });


// // Build javascript distribution
//   {input} --source-map-root={relroot}/ --source-map-url={name}.map{ext} --source-map={relpath}/{name}.map{ext} -o {output}

//   var sourceMap = UglifyJS.SourceMap({
//     file : null, // the compressed file name
//     root : null, // the root URL to the original sources
//     orig : null, // the input source map
//   });

//   gulp.src("lib/*.js")
//     .pipe(uglify({
//       output: {
//         source_map: sourceMap
//       }
//     }))
//     .pipe(gulp.dest("dist"))
// });

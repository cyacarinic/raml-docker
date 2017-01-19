'use strict';

var path = require('path');
var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var cleanCss = require('gulp-clean-css');
var exec = require('child_process').exec;

var argv = require('yargs').argv;

if(argv.path === undefined) {
  console.log("RAML path is not defined. Use 'gulp --path /path/file.raml'.");
  process.exit();
}

var CWD = path.resolve('.');

var API_DEST = path.resolve(CWD, 'docs');
if(argv.dest !== undefined) {
  var API_DEST = argv.dest;
}

var API_SPEC = argv.path;
var API_HTML = 'index.html';

function raml2html(options) {
  var gutil = require('gulp-util');
  var through = require('through2');
  var raml2html = require('raml2html');

  var simplifyMark = function(mark) {
    if (mark) mark.buffer = mark.buffer.split('\n', mark.line + 1)[mark.line].trim();
  }

  options = options || {};

  switch (options.type) {
    case 'json':
      var Q = require('q');
      options.config = {processRamlObj: function(raml) { return Q.fcall(function() {
        return JSON.stringify(raml, options.replacer, 'indent' in options ? options.indent : 2);
      })}};
      break;
    case 'yaml':
      var Q = require('q');
      var yaml = require('js-yaml');
      options.config = {processRamlObj: function(raml) { return Q.fcall(function() {
        return yaml.safeDump(raml, {skipInvalid: true, indent: options.indent, flowLevel: options.flowLevel});
      })}};
      break;
    default:
      options.type = 'html';
      options.config = options.config || raml2html.getDefaultConfig(options.template, options.templatePath);
  }

// ################################################################################
console.log("OPTIONS TYPE --> "+options.type);
// ################################################################################

  var stream = through.obj(function(file, enc, done) {
    var fail = function(message) {
      done(new gutil.PluginError('raml2html', message));
    };
    if (file.isBuffer()) {
      var cwd = process.cwd();
      process.chdir(path.resolve(path.dirname(file.path)));
      raml2html.render(file.contents, options.config).then(
        function(output) {
          process.chdir(cwd);
          stream.push(new gutil.File({
            base: file.base,
            cwd: file.cwd,
            path: gutil.replaceExtension(file.path, options.extension || '.' + options.type),
            contents: new Buffer(output)
          }));
          done();
        },
        function(error) {
          process.chdir(cwd);
          simplifyMark(error.context_mark);
          simplifyMark(error.problem_mark);
          process.nextTick(function() {
            fail(JSON.stringify(error, null, 2));
          });
      });
    }
    else if (file.isStream()) fail('Streams are not supported: ' + file.inspect());
    else if (file.isNull()) fail('Input file is null: ' + file.inspect());

  });

  return stream;
};

function logErrorAndQuit(err) {
  console.error(err.toString());
  this.emit('end');
};

gulp.task('raml-html', function() {
  var rename = require('gulp-rename');

  gulp.src([path.resolve(API_SPEC + '/..') + '/**/*', '!' + path.resolve(API_SPEC + '/..') + '/*.raml'])
    .pipe(gulp.dest(API_DEST + '/docs'));

  gulp.src(API_SPEC)
    .pipe(rename('index.raml'))
    .pipe(gulp.dest(API_DEST + '/docs'));

  return gulp.src(API_SPEC)
    .pipe(raml2html({template: 'template.nunjucks', templatePath: __dirname + '/template'}))
    .on('error', logErrorAndQuit)
    .pipe(rename(API_HTML))
    .pipe(gulp.dest(API_DEST));
});

gulp.task('css', function () {
  gulp.src('assets/css/styles.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCss({compatibility: 'ie8'}))
    .pipe(rename({
      basename: "styles",
      suffix: ".min",
      extname: ".css"
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(API_DEST + '/dist/css'));
});

gulp.task('js', function () {
  gulp.src('assets/js/*')
    .pipe(gulp.dest(API_DEST + '/dist/js'));
});

gulp.task('fonts', function () {
  gulp.src('assets/fonts/*')
    .pipe(gulp.dest(API_DEST + '/dist/fonts'));
});

gulp.task('images', function () {
  gulp.src('assets/images/*')
    .pipe(gulp.dest(API_DEST + '/dist/images'));
});

gulp.task('icons', function () {
  gulp.src('assets/icons/*')
    .pipe(gulp.dest(API_DEST + '/dist/icons'));
});

gulp.task('serve', function(cb) {
  exec('npm run serve', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

// Watch task
gulp.task('watch', function() {
    gulp.watch('template/*', ['raml-html']);
    gulp.watch(path.resolve(API_SPEC, '..', '*'), ['raml-html']);

    gulp.watch('assets/css/***/**/*.css', ['css']);
    gulp.watch('assets/css/**/*.scss', ['css']);

    gulp.watch('assets/fonts/*', ['fonts']);
    gulp.watch('assets/images/*', ['images']);
    gulp.watch('assets/icons/*', ['icons']);
    gulp.watch('assets/js/*.js', ['js']);
});

gulp.task('prod', ['raml-html', 'fonts', 'js', 'css', 'images', 'icons']);
gulp.task('default', ['raml-html', 'fonts', 'js', 'css', 'images', 'icons', 'serve', 'watch']);

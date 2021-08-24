
'use strict';

exports.init = function(grunt, phantomjs) {
  // node api
  var fs = require('fs'),
      path = require('path');

  // npm
  var rimraf = require('rimraf'),
      _ = require('lodash'),
      jasmineRequire = require('jasmine-core');

  var baseDir = '.',
      tempDir = '.grunt/grunt-contrib-jasmine';

  var exports = {};

  exports.writeTempFile = function(dest, contents) {
    var file = path.join(tempDir,dest);
    grunt.file.write(file, contents);
  };

  exports.copyTempFile = function(src, dest) {
    var file = path.join(tempDir,dest);
    grunt.file.copy(src, file);
  };

  exports.cleanTemp = function(cb) {
    rimraf(tempDir, function(){
      // if this fails, then ./.grunt isn't empty and that's ok.
      fs.rmdir('.grunt', cb);
    });
  };

  exports.buildSpecrunner = function (src, options, generateSpecNames){
    var source = '',
      outfile = options.outfile,
      specrunner = path.join(baseDir,outfile),
      outdir = path.dirname(outfile),
      gruntfilter = grunt.option("filter"),
      filteredSpecs = exports.getRelativeFileList(outdir, options.specs);

    var specNames;

    if(generateSpecNames) {

      specNames = [];

      for (var i = 0; i < filteredSpecs.length; i++) {
        var _spec = fs.readFileSync(filteredSpecs[i], 'utf8');

        try {
          var name = _spec.replace(/(?:\r\n|\r|\n)/g, '').split(/describe\s*\(\s*[\"\']/)[1].split(/[\"\']\s*[,]\s*function/)[0];
          specNames[specNames.length] = name;
        } catch (e) {

        }

      }

    }

    // filteredSpecs.splice(5, filteredSpecs.length);

    // console.log(filteredSpecs.length);

    // Let's filter through the spec files here,
    // there's no need to go on if no specs matches
    if (gruntfilter) {
      filteredSpecs = specFilter(gruntfilter, filteredSpecs);

      if(filteredSpecs.length === 0) {
        grunt.log.warn("the --filter flag did not match any spec within " + grunt.task.current.target);
        return null;
      }
    }

    exports.copyTempFile(__dirname + '/../jasmine/reporters/PhantomReporter.js', 'reporter.js');

    if(options.cover && options.coverage) {

      exports.copyTempFile(__dirname + '/../../vendor/blanket.js', 'blanket.js');

      exports.copyTempFile(__dirname + '/../../vendor/jasmine-2.x-blanket.js', 'jasmine-2.x-blanket.js');

      exports.copyTempFile(__dirname + '/../../vendor/lcov_reporter.js', 'lcov_reporter.js');

      exports.copyTempFile(__dirname + '/../../vendor/lz-string.js', 'lz_string.js');
    }

    [].concat(jasmineRequire.files.cssFiles, jasmineRequire.files.jsFiles).forEach(function(name) {
        var srcPath = path.join(jasmineRequire.files.path, name);
        exports.copyTempFile(srcPath, name);
    });

    jasmineRequire.files.bootFiles.forEach(function(name) {
        var srcPath = path.join(jasmineRequire.files.bootDir, name);
        exports.copyTempFile(srcPath, name);
    });

    exports.copyTempFile(path.join(jasmineRequire.files.imagesDir, 'jasmine_favicon.png'), 'jasmine_favicon.png');

    exports.copyTempFile(__dirname + '/../../../es5-shim/es5-shim.js', 'es5-shim.js');

    var reporters = [
      tempDir + '/reporter.js'
    ];

    var jasmineCss = jasmineRequire.files.cssFiles.map(function(name) {
      return path.join(tempDir, name);
    });

    jasmineCss = jasmineCss.concat(options.styles);

    var polyfills = [
      tempDir + '/es5-shim.js'
    ].concat(options.polyfills);

    var jasmineCore = jasmineRequire.files.jsFiles.map(function(name) {
      return path.join(tempDir, name);
    });

    var context = {
      temp : tempDir,
      outfile: outfile,
      css : exports.getRelativeFileList(outdir, jasmineCss, { nonull : true }),
      scripts : {
        polyfills : exports.getRelativeFileList(outdir, polyfills),
        jasmine : exports.getRelativeFileList(outdir, jasmineCore),
        helpers : exports.getRelativeFileList(outdir, options.helpers, { nonull : true }),
        specs : filteredSpecs,
        src : exports.getRelativeFileList(outdir, src, { nonull : true }),
        vendor : exports.getRelativeFileList(outdir, options.vendor, { nonull : true }),
        reporters : exports.getRelativeFileList(outdir, reporters),
        boot : exports.getRelativeFileList(outdir, tempDir + '/boot.js')
      },
      options : options.templateOptions || {}
    };

    if (options.template.process) {
      var task = {
        writeTempFile : exports.writeTempFile,
        copyTempFile : exports.copyTempFile,
        phantomjs : phantomjs
      };

      source = options.template.process(grunt, task, context);

      if(options.cover && options.coverage) {

          var coverStr = function(lcovString){
              return '<script data-cover-only="' + options.coverage.yes + '" data-cover-never="' + options.coverage.no + '" src=".grunt/grunt-contrib-jasmine/blanket.js" ' + lcovString + ' ></script><script src=".grunt/grunt-contrib-jasmine/jasmine-2.x-blanket.js"></script><script src=".grunt/grunt-contrib-jasmine/lz_string.js"></script>';
          };

          // Below is very very dirty. Will remove it with alternative method soon.
          var customSource = source;
          var fname = specrunner.replace('.html', '_phantom.html');
          var repString = '<script src=".grunt/grunt-contrib-jasmine/boot.js"></script>';
          var lcovString = ' data-cover-reporter=".grunt/grunt-contrib-jasmine/lcov_reporter.js" data-cover-reporter-options=\'{ "toHTML": false}\' ';
          var str = repString + coverStr(lcovString);
          customSource = customSource.replace(repString, str);
          str = repString + coverStr('');
          source = source.replace(repString, str);
          grunt.file.write(fname, customSource);
      }

      grunt.file.write(specrunner, source);
    } else {
      grunt.file.copy(options.template, specrunner, {
        process : function(src) {
          source = _.template(src, context);
          return [source, specNames];
        }
      });
    }

    return  [source, specNames];
  };

  exports.getRelativeFileList = function(outdir, patterns, options) {
    patterns = patterns instanceof Array ? patterns : [ patterns ];
    options = options || {};

    // var files = grunt.file.expand(options, grunt.util._(patterns).compact());
    // files = grunt.util._(files).map(function(file){
	var files = grunt.file.expand(options, _.compact(patterns)).map(function(file) {
      return (/^https?:/).test(file) ? file : path.relative(outdir, file).replace(/\\/g, '/');
    });
    return files;
  };

  // Allows for a spec file to be specified via the command line
  function specFilter(pattern, files) {
    var specPattern,
      patternArray,
      filteredArray = [],
      scriptSpecs = [],
      matchPath = function(path) {
        return !!path.match(specPattern);
      };

    if(pattern) {
      // For '*' to work as a wildcard.
      pattern = pattern.split("*").join("[\\S]*").replace(/\./g, "\\.");
      // This allows for comma separated strings to which we can match the spec files.
      patternArray = pattern.split(",");

      while(patternArray.length > 0) {
        if(pattern.length > 0) {
          if(pattern.indexOf('/') === -1) {
            specPattern = new RegExp("("+pattern+"[^/]*)(?!/)$", "ig");
          } else if(pattern.indexOf('/') === 0) {
            specPattern = new RegExp("("+pattern+"[^/]*)(?=/)", "ig");
          } else {
            throw new TypeError("--filter flag seems to be in the wrong format.");
          }

          // push is usually faster than concat.
          [].push.apply(scriptSpecs, files.filter(matchPath));
        }

        pattern = (patternArray.splice(0, 1)[0]);
      }

      filteredArray = _.uniq(scriptSpecs);

      grunt.log(filteredArray);

    }

    return filteredArray;
  }

  return exports;
};


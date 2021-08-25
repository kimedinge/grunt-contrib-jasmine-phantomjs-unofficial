# grunt-contrib-jasmine-phantom v0.8.8 [![Build Status](https://app.travis-ci.com/kimedinge/grunt-contrib-jasmine-phantomjs-unofficial.svg?branch=master)](https://app.travis-ci.com/kimedinge/grunt-contrib-jasmine-phantomjs-unofficial.svg?branch=master)

> Run jasmine specs headlessly through PhantomJS.



## Getting Started

This plugin is a fork of grunt-contrib-jasmine-phantom. This plugin works around solving an issue with glob pattern in strings.

Todos : Rewrite tests for this plugin, check all the other functionalities.

This plugin is tested with Grunt-cli '~1.4.3' which has dependency to Grunt `~1.3.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-contrib-jasmine-phantomjs-unofficial --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-contrib-jasmine-phantomjs-unofficial');
```




## Jasmine task
_Run this task with the `grunt jasmine` command._

If you want to run specific Suite or any spec. _Run this task with the `grunt jasmine:unit:run="suite1|suite2|......etc"`

`unit` -> It contains options for jasmine task to run specs.

Automatically builds and maintains your spec runner and runs your tests headlessly through PhantomJS.

#### Run specs locally or on a remote server

Run your tests on your local filesystem or via a server task like [grunt-contrib-connect][].

#### Run with code coverage

Specify coverage field in options passed as mentioned in options section and the run `jasmine:unit --coverage`

#### Customize your SpecRunner with templates

Use your own SpecRunner templates to customize how `grunt-contrib-jasmine` builds the SpecRunner. See the
[wiki](https://github.com/gruntjs/grunt-contrib-jasmine/wiki/Jasmine-Templates) for details and third party templates for examples.

##### AMD Support

Supports AMD tests via the [grunt-template-jasmine-requirejs](https://github.com/jsoverson/grunt-template-jasmine-requirejs) module

##### Third party templates

- [RequireJS](https://github.com/jsoverson/grunt-template-jasmine-requirejs)
- [Code coverage output with Istanbul](https://github.com/maenu/grunt-template-jasmine-istanbul)
- [StealJS](https://github.com/jaredstehler/grunt-template-jasmine-steal)

[grunt-contrib-connect]: https://github.com/gruntjs/grunt-contrib-connect


### Options

#### coverage
Type: `Object`

Configuration to run code coverage. By the default this plugin uses Blanket js.

Example: 
  
    coverage: {
        yes: 'app/', // To be covered
        no: "[spec, app/vendor]", // To be skipped
        onCoverage: function(cb) { // Callback to run after all specs executed.
            // Do your stuff with this.lcovPath, this.leastCovered and this.percentage
            cb();
        }
    }

#### src
Type: `String|Array`

Your source files. These are the files that you are testing. If you are using RequireJS your source files will be loaded as dependencies into your spec modules and will not need to be placed here.

#### options.specs
Type: `String|Array`

Your Jasmine specs.

#### options.vendor
Type: `String|Array`

Third party libraries like jQuery & generally anything loaded before source, specs, and helpers.

#### options.helpers
Type: `String|Array`

Non-source, non-spec helper files. In the default runner these are loaded after `vendor` files

#### options.styles
Type: `String|Array`

CSS files that get loaded after the jasmine.css

#### options.version
Type: `String`  
Default: '2.0.1'

This is the jasmine-version which will be used. currently available versions are:

* 2.0.1
* 2.0.0

*Due to changes in Jasmine, pre-2.0 versions have been dropped and tracking will resume at 2.0.0*

#### options.outfile
Type: `String`  
Default: `_SpecRunner.html`

The auto-generated specfile that phantomjs will use to run your tests.
Automatically deleted upon normal runs. Use the `:build` flag to generate a SpecRunner manually e.g.
`grunt jasmine:myTask:build`

#### options.keepRunner
Type: `Boolean`  
Default: `false`  

Prevents the auto-generated specfile used to run your tests from being automatically deleted.

#### options.junit.path
Type: `String`  
Default: undefined

Path to output JUnit xml

#### options.junit.consolidate
Type: `Boolean`  
Default: `false`

Consolidate the JUnit XML so that there is one file per top level suite.

#### options.junit.template
Type: `String`  
Default: undefined

Specify a custom JUnit template instead of using the default `junitTemplate`.

#### options.host
Type: `String`  
Default: ''

The host you want PhantomJS to connect against to run your tests.

e.g. if using an ad hoc server from within grunt

```js
host : 'http://127.0.0.1:8000/'
```

Without a `host`, your specs will be run from the local filesystem.

#### options.template
Type: `String` `Object`  
Default: undefined

Custom template used to generate your Spec Runner. Parsed as underscore templates and provided
the expanded list of files needed to build a specrunner.

You can specify an object with a `process` method that will be called as a template function.
See the [Template API Documentation](https://github.com/gruntjs/grunt-contrib-jasmine/wiki/Jasmine-Templates) for more details.

#### options.templateOptions
Type: `Object`  
Default: `{}`

Options that will be passed to your template. Used to pass settings to the template.

#### options.polyfills
Type: `String|Array`

Third party polyfill libraries like json2 that are loaded at the very top before anything else. es5-shim is loaded automatically with this library.

#### options.display
Type: `String`  
Default: `full`

  * `full` displays the full specs tree
  * `short` only displays a success or failure character for each test (useful with large suites)
  * `none` displays nothing

#### options.summary
Type: `Boolean`  
Default: `false`

Display a list of all failed tests and their failure messages


#### options.handlers
Type: `Object`,
Default : `{}`

If you want to attach any event on Phantom instance pass them through handlers object with event name as key and handler as value.

### Flags

Name: `build`

Turn on this flag in order to build a SpecRunner html file. This is useful when troubleshooting templates,
running in a browser, or as part of a watch chain e.g.

```js
watch: {
  pivotal : {
    files: ['src/**/*.js', 'specs/**/*.js'],
    tasks: 'jasmine:pivotal:build'
  }
}
```

### Filtering specs

**filename**
`grunt jasmine --filter=foo` will run spec files that have `foo` in their file name.

**folder**
`grunt jasmine --filter=/foo` will run spec files within folders that have `foo*` in their name.

**wildcard**
`grunt jasmine --filter=/*-bar` will run anything that is located in a folder `*-bar`

**comma separated filters**
`grunt jasmine --filter=foo,bar` will run spec files that have `foo` or `bar` in their file name.

**flags with space**
`grunt jasmine --filter="foo bar"` will run spec files that have `foo bar` in their file name.
`grunt jasmine --filter="/foo bar"` will run spec files within folders that have `foo bar*` in their name.

#### Example application usage

- [Pivotal Labs' sample application](https://github.com/jsoverson/grunt-contrib-jasmine-example)


#### Basic Use

Sample configuration to run Pivotal Labs' example Jasmine application.

```js
// Example configuration
grunt.initConfig({
  jasmine: {
    pivotal: {
      src: 'src/**/*.js',
      options: {
        specs: 'spec/*Spec.js',
        helpers: 'spec/*Helper.js'
      }
    }
  }
});
```

#### Supplying a custom template

Supplying a custom template to the above example

```js
// Example configuration
grunt.initConfig({
  jasmine: {
    customTemplate: {
      src: 'src/**/*.js',
      options: {
        specs: 'spec/*Spec.js',
        helpers: 'spec/*Helper.js',
        template: 'custom.tmpl'
      }
    }
  }
});
```

#### Supplying template modules and vendors

A complex version for the above example

```js
// Example configuration
grunt.initConfig({
  jasmine: {
    customTemplate: {
      src: 'src/**/*.js',
      options: {
        specs: 'spec/*Spec.js',
        helpers: 'spec/*Helper.js',
        template: require('exports-process.js')
        vendor: [
          "vendor/*.js",
          "http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"
        ]
      }
    }
  }
});
```

#### Sample RequireJS/NPM Template usage

```js
// Example configuration
grunt.initConfig({
  jasmine: {
    yourTask: {
      src: 'src/**/*.js',
      options: {
        specs: 'spec/*Spec.js',
        template: require('grunt-template-jasmine-requirejs')
      }
    }
  }
});
```

NPM Templates are just node modules, so you can write and treat them as such.

Please see the [grunt-template-jasmine-requirejs](https://github.com/jsoverson/grunt-template-jasmine-requirejs) documentation
for more information on the RequireJS template.


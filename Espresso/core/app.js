// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: 2011 M-Way Solutions GmbH. All rights reserved.
// Creator:   alexander
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

var E = require('./e').E;
var TaskManager = require('./task_manager').TaskManager;
var Framework = require('./framework').Framework;
var Report = require('./report').Report;
var Resource = require('./resource').Resource;
var Utils = require('../lib/espresso_utils');
var HTML = Utils.HTML;
var normalize = require('path').normalize;

// MS dangerous addition trying to get console.log to work.
process.on('uncaughtException', function(err) {
    console.log(err);
});

/**
 * @class
 *
 * Definition of App class. App is Espresso�s core component.
 * App holds all information about the "The-M-Project" application that is build via Espresso.
 * Containing properties of the application and to control the build itself.
 * App takes care of the build process by hooking in the needed resources (Frameworks and Files)
 * and calling build on each resource(s).
 * For doing all this cool stuff, App needs some data/information to work with.
 * Those things are implemented in extra components.
 * App can contain multiple references to Framework (e.g. The-M-Project core files or the application itself).
 * By loading new Frameworks, App is adding a defined task chain to each Framework.
 * The task chain is prepared by the TaskManager.
 *
 * @param build_options, the options to customize the build process
 *
 * @extends E
 *
 * @constructor
 */

// TODO: Remove tight coupling to server
// TODO: Generate index.html with a template not by string concatination
// TODO: Refactoring

var App = exports.App = function (options, server) {
  var applicationDirectory;

  /* Properties */

  /* Build configuration */
  this.displayName = '';
  this.targetQuery = '';
  this.libraries = [];

  this.server            = server || {};
  this.buildVersion      = Date.now();  // timestamp of the build.

  this.clear             = '';
  this.applicationDirectory          = '';  //  the a actually folder name, in which the application is located.
  this.name              = 'defaultName';
  this.theme             = 'default';
  this.outputFolder      = 'build'; // name of the output folder, default is 'build'.

  /* Build switches */
  this.jslintCheck         = false;
  this.eliminate           = false;
  this.reachable           = null;
  this.minify              = false;  // uses minfiy task ?! default is false
  this.offlineManifest     = true;   // build with offline manifest ?! default is true
  this.mode                = "debug";
  this.debugLevel          = 1;

  this.taskChain           = [];
  this.proxies             = [];
  this.supportedLanguages  = [];
  this.excludedFolders     = [];
  this.excludedFiles       = [];
  this.excludedFromCaching = [];
  this.frameworks          = [];
  this.globalState         = {};

  this.imagesToPreload      = [];
  this.preloadImages       = false;

  this.HEAD_IndexHtml = [];
  this.BODY_IndexHtml = [];

  this.target = {};
  this.librariesNamesForIndexHtml = [];
  this.coreFrameworks = {};

  this.manifest  = {
    "cache" : [],
    "network" : [],
    "fallback" : []
  };

  this.reporter = new Report();
  this.applicationDirectory = options.directory;

  this.loadJSONConfig();
};

/*
 * Getting all basic Espresso functions from the root prototype: M
 */
App.prototype = new E();

/**
 * @description
 * Sets the build options for the app (project) to be build.
 * @param build_options the options to customize the build process
 */
App.prototype.addOptions = function (build_options) {
  var that = this;
  Object.keys(build_options).forEach(function (key) {
    that[key] = build_options[key];
  });
};

/**
 * @description
 * Loads the config file, passed in JSON syntax.
 * The 'config.json', should be in the root folder of the project to build.
 */
App.prototype.loadJSONConfig = function () {
  var config = Utils.readConfig(this.applicationDirectory);
  this.addOptions(config);

  if (config.cacheFallbacks) {
    // adding specific fallbacks for cache.manifest
    this.manifest.fallback = config.cacheFallbacks;
  };
};

/**
 * @description
 * Adding a Framework to the current build.
 */
App.prototype.addFrameworks = function (frameworks) {
  var that = this;
  if (frameworks instanceof Array) {
    frameworks.forEach(function (framework) {
      that.frameworks.push(framework);
    });
    for (var i=0; i<frameworks.length; ++i) {
        console.log("Added 2 framework with path: "+frameworks[i].path);
    }
  };
};


/**
 * @description
 * Remove excludedFiles from the View directory
 *
 */
App.prototype.excludeDeviceSpecificViews = function (excludedFolders, excludedFiles) {
    var that = this;
    var path = require('path');
    var exists = path.existsSync((that.applicationDirectory + normalize('/app/views/')));
    if(exists){
        var viewDir = that._e_.fs.readdirSync(that.applicationDirectory + normalize('/app/views/'));
        var files = '';
        viewDir.forEach(function(directoryName, ind){
            if(that.targetQuery.subGroup && directoryName !== that.targetQuery.subGroup){
                excludedFolders.push(directoryName);
            }
        });
    }
}

/**
 * @description
 * Load the projects related files.
 * The project is equals the application.
 */
App.prototype.loadTheApplication = function () {
  var that = this,
      _theApplication = [],
      _theApplicationResources,
      _i18n;


  _theApplication = ['app'].map(function (module) {
    var _frameworkOptions  = {};
    _frameworkOptions.path = that.applicationDirectory + '/' + module;
    _frameworkOptions.name = that.name + '_App';
    _frameworkOptions.frDelimiter = that.applicationDirectory + '/';
    _frameworkOptions.excludedFolders = ['resources'].concat(that.excludedFolders);
    _frameworkOptions.excludedFiles = ['.DS_Store'].concat(that.excludedFiles);
    _frameworkOptions.app = that;
    that.excludeDeviceSpecificViews(_frameworkOptions.excludedFolders, _frameworkOptions.excludedFiles);
      console.log(_frameworkOptions.excludedFolders);
//      console.log(_frameworkOptions.excludedFiles);
    if (!that.eliminate) {
        console.log("No file elimination");
      _frameworkOptions.taskChain = new TaskManager([
        "preSort",
        "dependency",
        "merge",
        "minify",
        "contentType",
        "manifest"
      ]).getTaskChain();
    } else {
        console.log("WITH file elimination");
      _frameworkOptions.taskChain = new TaskManager([
        "preSort",
        "dependency",
        "analyze",
        "globalAnalyze",
        "eliminate",
        "merge",
        "minify",
        "contentType",
        "manifest"
      ]).getTaskChain();
    };
    return new Framework(_frameworkOptions);
  });
  this.addFrameworks(_theApplication);

  _theApplicationResources = ['app/resources'].map(function (module) {
    var _frameworkOptions  = {};
    _frameworkOptions.path = that.applicationDirectory + '/' + module;
    _frameworkOptions.name = that.name + '_AppResources';
    _frameworkOptions.frDelimiter = that.applicationDirectory+'/';
    _frameworkOptions.excludedFolders = that.excludedFolders;
    _frameworkOptions.excludedFiles = ['.DS_Store'].concat(that.excludedFiles);
    _frameworkOptions.app = that;
    _frameworkOptions.taskChain = new TaskManager([
      "contentType",
      "manifest",
      "preloadImages"
    ]).getTaskChain();
    return new Resource(_frameworkOptions);
  });
  this.addFrameworks(_theApplicationResources);
};

/**
 * @description
 * Called when adding The-M-Project to the current build.
 * Loads the files for the core system.
 */
App.prototype.loadTheMProject = function () {
  var that = this,
      _theMProject,
      _theMProjectResources,
      _jQueryPlugins,
      _jquery,
      _path_to_the_m_project =
          this.touchPath(that.applicationDirectory + '/frameworks/The-M-Project')
          ? that.applicationDirectory + '/frameworks/The-M-Project'
          : that.applicationDirectory + '/frameworks/Mproject'
          ;
  /*
   * Getting all The-M-Project core files
   * and generate Framework objects.
   */
  _theMProject = ['core','ui'].map(function (module) {
    var _frameworkOptions  = {};
    _frameworkOptions.path = _path_to_the_m_project + '/modules/' + module;
    _frameworkOptions.name = module;
    _frameworkOptions.app = that;
    _frameworkOptions.frDelimiter = 'modules/';
    _frameworkOptions.excludedFolders = that.excludedFolders;
    _frameworkOptions.excludedFiles = ['.DS_Store'].concat(that.excludedFiles);
    /* Definition of standard build chain for The-M-Project's core files */
    if (!that.eliminate) {
      _frameworkOptions.taskChain = new TaskManager([
        "dependency",
        "merge",
        "minify",
        "contentType",
        "manifest"
      ]).getTaskChain();
    } else {
      _frameworkOptions.taskChain = new TaskManager([
        "dependency",
        "analyze",
        "eliminate",
        "merge",
        "minify",
        "contentType",
        "manifest"
      ]).getTaskChain();
    };
    return new Framework(_frameworkOptions);
  });
  this.addFrameworks(_theMProject);

  /*
   * Getting the The-M-Project resources and third party frameworks,
   * like: jquery.js or underscore.js
   *
   * use filter() to make sure the files exists
   */
  _theMProjectResources = [
    'jquery',
    'underscore',
    'd8',
    'themes',
    'tmp_themes',
    'bootstrapping'
  ].filter(function (module){
    return require('path').existsSync(_path_to_the_m_project + '/modules/' + module);
  }).map(function (module) {
    var _frameworkOptions  = {};
    _frameworkOptions.path = _path_to_the_m_project + '/modules/' + module;
    _frameworkOptions.name = module;
    _frameworkOptions.app = that;
    _frameworkOptions.frDelimiter = 'modules/';
    _frameworkOptions.excludedFolders = that.excludedFolders;
    _frameworkOptions.excludedFiles = ['.DS_Store'].concat(that.excludedFiles);
    _frameworkOptions.taskChain = new TaskManager([
      "contentType",
      "markCoreFramework",
      "manifest"
    ]).getTaskChain();
    return new Framework(_frameworkOptions);
  });
  this.addFrameworks(_theMProjectResources);

  /*
   * Load some jQuery Mobile plugins.
   * NOTE: Implemented this only for testing of datepicker and splitview.
   *       As long as there is not clear definition of how to refer plugins
   *       automatically, this stays here.
   */
  _jQueryPlugins = [
    'jquery_mobile_plugins'
  ].map(function (module) {
    var _frameworkOptions = {};
    _frameworkOptions.path = _path_to_the_m_project + '/modules/' + module;
    _frameworkOptions.name = module;
    _frameworkOptions.app = that;
    _frameworkOptions.is_a_plugin = true;
    _frameworkOptions.frDelimiter = 'modules/';
    _frameworkOptions.excludedFolders = that.excludedFolders;
    _frameworkOptions.excludedFiles = ['.DS_Store'].concat(that.excludedFiles);
    _frameworkOptions.taskChain = new TaskManager([
      "merge",
      "markCoreFramework",
      "contentType",
      "manifest"
    ]).getTaskChain();
    return new Framework(_frameworkOptions);
  });

  if (this.touchPath(that.applicationDirectory + '/frameworks/The-M-Project/modules/jquery_mobile_plugins')) {
    this.addFrameworks(_jQueryPlugins);
  };

  _jquery = [
    'jquery_mobile'
  ].map(function (module) {
    var _frameworkOptions = {};
    _frameworkOptions.path = _path_to_the_m_project + '/modules/' + module;
    _frameworkOptions.name = module;
    _frameworkOptions.app = that;
    _frameworkOptions.frDelimiter = 'modules/';
    _frameworkOptions.excludedFolders = that.excludedFolders;
    _frameworkOptions.excludedFiles = ['.DS_Store'].concat(that.excludedFiles);
    _frameworkOptions.taskChain = new TaskManager([
      "merge",
      "contentType",
      "markCoreFramework",
      "manifest"
    ]).getTaskChain();
    return new Framework(_frameworkOptions);
  });
  this.addFrameworks(_jquery);
};

/**
 * @description
 * Builds the index.html page. Used for loading the application.
 */
App.prototype.buildIndexHTML = function (callback, _frameworkNamesForIndexHtml, _HEAD_IndexHtml) {
  var that = this,
      _displayName = this.displayName ? this.displayName : this.name,
      _indexHtml = [];

/*
  _indexHtml.push(HTML('html', {
    manifest: this.offlineManifest && 'cache.manifest',
    "class": "ui-mobile"
  }));
  */

  _HEAD_IndexHtml.forEach(function (head) {
    _indexHtml.push(head);
  });


/*
    /*preload*/
  if(that.preloadImages){
      _indexHtml.push(HTML('script', {
          type: 'application/javascript',
          src: 'preloadImages.js'
      }, ''));
  }

  _frameworkNamesForIndexHtml.forEach(function (name) {
    var match = /^(.*\/)?([^\/]+(\.[^.\/]+))$/.exec(name);
    if (match) {
      var basename = match[2];
      var extension = match[3];
      switch (extension) {
        case '.js':
          return _indexHtml.push(HTML('script', {
            type: 'application/javascript',
            src: basename
          }, ''));
        case '.css':
          return _indexHtml.push(HTML('link', {
            type: 'text/css',
            href: 'theme/' + basename,
            rel: 'stylesheet'
          }));
      };
    };
  });

  _indexHtml.push(HTML('script', {
    type: 'application/javascript',
    src: this.name + '_App.js'
  }, ''));
    
  _indexHtml.push(HTML('/head'));
  _indexHtml.push(HTML('body'));
  _indexHtml.push(HTML('/body'));
  _indexHtml.push(HTML('/html'));

  _indexHtml = _indexHtml.join('\n');

  var _frameworkOptions  = {};
  _frameworkOptions.path = this.applicationDirectory;
  _frameworkOptions.name = 'IndexHtml';
  _frameworkOptions.app = this;
  _frameworkOptions.virtual = true;
  _frameworkOptions.frDelimiter = '/';
  // Definition of standard build chain for The-M-Project's core files
  _frameworkOptions.taskChain = new TaskManager([
    "contentType",
    "manifest"
  ]).getTaskChain();

  var fr = new Framework(_frameworkOptions);

  fr.files.push(new File({
    frDelimiter: fr.frDelimiter,
    virtual: true,
    name:'/index.html',
    path:'/index.html',
    requestPath :'index.html',
    contentType : 'text/html',
    framework: fr, /* the framework, this file belongs to. */
    content: _indexHtml
  }));
  var ar = [];
  ar.push(fr);
  this.addFrameworks(ar);
  callback(null,this.frameworks);
};

/**
 * @description
 * Build a HTML5 valid cache.manifest file.
 * @param callback
 */
App.prototype.buildManifest = function (callback) {
  var self = this, _cacheManifest = [];

  if (!self.offlineManifest) {
    callback();
  } else {
    /* adding entries for the Explicit CACHE section*/
    _cacheManifest.push(
      'CACHE MANIFEST',
      '#Application:' + this.name
      + ', Version:'
      +  (typeof this.application !== 'undefined' && this.application !== null && typeof this.application.version !== 'undefined'
          ? this.application.version
          : (typeof this.version !== 'undefined'
             ? this.version
             : '-'))
      + ', Timestamp:' + this.buildVersion, //adding 'header' information.
      '\n',
      '# Explicitly cached entries',
      'CACHE:'
    );
    this.manifest.cache.forEach(function (expliFile) {
      _cacheManifest.push(expliFile);
    });

    /* adding entries for the NETWORK section*/
    _cacheManifest.push(
      '\n',
      '# Resources that require the device/user to be online.',
      'NETWORK:'
    );
    this.manifest.network.forEach(function (networkFile) {
      // Files, exclude from explicitly section by user.
      _cacheManifest.push(networkFile);
    });

    this.proxies.forEach(function (proxy) {
      // Proxy entries.
      _cacheManifest.push(proxy.proxyAlias);
    });

    // enable wildcard.
    _cacheManifest.push('*');

    /* adding entries for the FALLBACK section */
    _cacheManifest.push(
      '\n# Fallback resources ',
      'FALLBACK:'
    );
    this.manifest.fallback.forEach(function (fallbackFile) {
      _cacheManifest.push(fallbackFile);
    });

    var _frameworkOptions  = {};
    _frameworkOptions.path = this.applicationDirectory;
    _frameworkOptions.name = 'chacheManifest';
    _frameworkOptions.app = this;
    _frameworkOptions.virtual = true;
    _frameworkOptions.frDelimiter = '/';
    _frameworkOptions.taskChain = new TaskManager([
      "void"
    ]).getTaskChain();
    var fr = new Framework(_frameworkOptions);
    fr.files.push(new File({
      frDelimiter: fr.frDelimiter,
      virtual: true,
      name:'/cache.manifest',
      path:'/cache.manifest',
      contentType : 'text/cache-manifest',
      requestPath :'cache.manifest',
      framework: fr, /* the framework, this file belongs to.*/
      content: _cacheManifest.join('\n')
    }));
    var ar = [];
    ar.push(fr);
    this.addFrameworks(ar);
    callback(null,this.frameworks);
  };
};

App.prototype.buildPreloadFile = function (callback) {
    var self = this, _cacheManifest = [];

    if (!self.preloadImages) {
        callback();
    } else {
        var _frameworkOptions  = {};
        _frameworkOptions.path = this.applicationDirectory;
        _frameworkOptions.name = 'preload';
        _frameworkOptions.app = this;
        _frameworkOptions.virtual = true;
        _frameworkOptions.frDelimiter = '/';
        _frameworkOptions.taskChain = new TaskManager([
            "void"
        ]).getTaskChain();
        var fr = new Framework(_frameworkOptions);
        fr.files.push(new File({
            frDelimiter: fr.frDelimiter,
            virtual: true,
            name:'/preloadImages.js',
            path:'/preloadImages.js',
            contentType : 'application/javascript',
            requestPath :'preloadImages.js',
            framework: fr, /* the framework, this file belongs to.*/
            content: 'M.Application.config["preloadImages"] = ' + self.preloadImages + ';\nM.Application.config["imagesToPreload"] = ' + JSON.stringify(self.imagesToPreload) + ';'
        }));
        this.addFrameworks([fr]);
        callback(null,this.frameworks);
    };
};


/**
 * @description
 * Function to generate the projects output folders.
 * @param {function}, the function that should be called after the output folders are made.
 */
App.prototype.makeOutputFolder = function (callback) {
  var self = this;
  var _outputPath = this.applicationDirectory+'/'+this.outputFolder;
  self._outP = [];
  self._outP.push(_outputPath);
  self._outP.push('/'+this.buildVersion);
  self._outP.push('/theme');
  self._outP.push('/images');

  var _OutputDirMaker = function (callback) {
    var that = this;
    //console.log('output dir maker called');
    that._folderCounter = 4; /*make 4 folders*/

    that.callbackIfDone = function () {
      if (that._folderCounter === 0) {
        callback();
      };
    };

    that.makeOutputDir = function (path) {
      if (that._folderCounter >=1) {
        self._e_.fs.mkdir(path, 0777 ,function (err) {
          if (err) {
            if (err.code === 'EEXIST') {
              // ok: directory already exists; that's what we want!
            } else {
              // this is the "old-and-underdocumented" behavior
              if (err && err.errno !== 17) {throw err;}
            };
          };
          that._folderCounter--;
          that.makeOutputDir(path+ self._outP.shift());
        });
      };
      that.callbackIfDone();
    };
  };
  new _OutputDirMaker(callback).makeOutputDir(self._outP.shift());
};

App.prototype.readTargetConfig = function (tar) {
  var that = this,
      _targetsJSON =
          this._e_.path.join(this.applicationDirectory, 'targets.json');

  try {
    var targets = JSON.parse(this._e_.fs.readFileSync(_targetsJSON, 'utf8'));

    if (targets) {
      if (targets[tar.group]) {
        var _group = targets[tar.group];
        that.target.group = tar.group;
        if (_group[tar.subGroup]) {
          var _subGroup = _group[tar.subGroup];

          if (_subGroup.dedicatedResources) {
            that.target.dedicatedResources = _subGroup.dedicatedResources;
          } else {
            that.reporter.warnings.push(
                this.style.cyan('No dedicatedResources defined, for "')
                + this.style.magenta(tar.subGroup)
                + this.style.cyan(
                      '" using "base" and "'+ tar.group + '" only.'));
          };

          if (_subGroup.htmlHeader) {
            that.HEAD_IndexHtml = _subGroup.htmlHeader;
          };
        } else {
          that.reporter.warnings.push(
              this.style.cyan('No subGroup defined, for "')
              + this.style.magenta(tar.subGroup)
              + this.style.cyan('" using "base" and "'+ tar.group +'" only.'));
        };
      } else {
        that.reporter.warnings.push(this.style.cyan('No group ')
            //  + this.style.magenta(tar.group)
            + this.style.cyan('specified, using "base" only.'));
      };
    };
  } catch (ex) {
    if (ex.code !== 'ENOENT') {
      console.log(this.style.red('ERROR:')
          + this.style.cyan(' - while reading "targets.json", error message: '
          + ex.message));
      process.exit(1);
    };
  };
};

App.prototype.addUsedFrameworks = function (usedFrameworks) {
  var that = this;
  var _usedFrameworks = usedFrameworks.map(function (module) {
    var _frameworkOptions = {};
    _frameworkOptions.path =
        that.applicationDirectory + '/frameworks/' + module;
    _frameworkOptions.name = module;
    _frameworkOptions.library = true;
    _frameworkOptions.app = that;
    _frameworkOptions.frDelimiter = 'modules/';
    _frameworkOptions.excludedFolders = that.excludedFolders;
    _frameworkOptions.excludedFiles = ['.DS_Store'].concat(that.excludedFiles);
    _frameworkOptions.taskChain = new TaskManager([
      "contentType",
      "markLibrary",
      "manifest"
    ]).getTaskChain();
    return new Framework(_frameworkOptions);
  });
  for (var i in _usedFrameworks) {
      if (_usedFrameworks[i] && _usedFrameworks[i].path) {
          console.log("Added Used Framework: "+_usedFrameworks[i].path);
      } else {
          console.log("Adding Used Framework with no valid path (?)");
      }
  }
  console.log("Done listing added frameworks");
  this.addFrameworks(_usedFrameworks);
};


/**
 * @description
 * The function that builds the application.
 * @param callback that should be called after the build.
 */
App.prototype.build = function (callback) {
  var self = this,
      _frameworks = [];

    console.log("In App.build: ");
  // reset the global state
  self.globalState = {};

  if (self.htmlHeader) {
    self.HEAD_IndexHtml = self.htmlHeader;
  };

  if (self.targetQuery) {
    this.readTargetConfig(self.targetQuery);
  };

  if (self.libraries) {
    self.libraries.forEach(function (fr) {
        if (fr.name) {
            _frameworks.push(fr.name);
        } else {
            _frameworks.push(fr);
            console.log("Added library framework name "+fr);
        }
    });

      console.log("NEW: About to add used frameworks");
    self.addUsedFrameworks(_frameworks);
  };

  var _AppBuilder = function (app, callback) {
    var that = this;

    /* amount of used frameworks, for this application. */
    that._frameworkCounter = app.frameworks.length;

    /* callback checker, called if all frameworks are built. */
    that.callbackIfDone = function () {
      if (callback && that._frameworkCounter <= 0) {
        console.log('build callback called !');
        callback(null,self.frameworks);
      };
    };

    that.build = function () {
      console.log(self.style.green("Building components:"));
      app.frameworks.forEach(function (framework) {
          console.log("About to call build for framework "+framework.name);
        framework.build(function (fr) {
          // count = -1 if a framework had been built
          that._frameworkCounter -= 1;
          console.log(self.style.magenta(fr.name)
            + self.style.green(': ')
            + self.style.cyan('done'));
          // check if callback can be called, the condition ist that all
          // frameworks has been build
          that.callbackIfDone();
        });
      });
    };
  };

  /*
   *  Build stack:
   *  1) Build the application
   *   11) Build each framework
   *  2) Build the index.html
   *  3) Build the cache manifest, after all frameworks had been built.
   *  4) Call callback, which leads to the next step of the build OR server
   *     process.
   */
  self.sequencer(
      function () {
        console.log(self.style.green('Building application: "')
          + self.style.magenta(self.name)
          + self.style.green('"'));
        new _AppBuilder(self, this).build();
      },
      function (err, frameworks) {
        if (err) { throw err; }
// MS customization changing .librariesNamesForIndexHtml
        self.librariesNamesForIndexHtml = self.libraries;
        self.buildIndexHTML(this,
          self.librariesNamesForIndexHtml,
          self.HEAD_IndexHtml);
      },
      function (err, frameworks) {
        if (err) { throw err; }
        self.buildManifest(this);
      },
      function (err, frameworks) {
          if (err) { throw err; }
          self.buildPreloadFile(this);
      },
      function (err, frameworks) {
        if (err) { throw err; }
        self.reporter.printReport();
        callback();
      }
  );
};

/**
 * @description
 * Saves the application to the filesystem. Inside the app folder, specified by the
 * outputFolder property.
 * @param callback that should be called after the build.
 */
App.prototype.saveLocal = function (callback) {
  var self = this;

  var _AppSaver = function (app, callback) {
    var that = this;

    // amount of used frameworks, for this application.
    that._frameworkCounter = app.frameworks.length;

    // callback checker, called if all frameworks are build. 
    that.callbackIfDone = function () {
      if (callback && that._frameworkCounter <= 0) {
        callback();
      };
    };

    that.save = function () {
        app.frameworks.forEach(function (framework) {
        framework.save(function (fr) {
          // count = -1 if a framework has been saved.
          that._frameworkCounter -= 1;
          that.callbackIfDone();
        });
      });
    };
  };

  /*
   *  build batch:
   *  1) make output folder structure first.
   *  2) Call AppSaver to write the application data, into the
   *     just generated file structure.
   *  3) Call callback, which prompts the massage: 'Saved application to filesystem!'.
   */
  this.makeOutputFolder(function () {
    new _AppSaver(self, function () {
      console.log('\n');
      console.log(self.style.green('saving application to filesystem!'));
      console.log("\n");
      if (typeof callback === 'function') {
        callback();
      };
    }).save();
  });
};

/**
 * @description
 * Prepare the frameworks and the files, to attache them to the server.
 * @param callback
 */
App.prototype.prepareForServer = function (callback) {
  var self = this;

  var _AppPreparer = function (app, callback) {
    var that = this;

    // amount of used frameworks, for this application.
    that._frameworkCounter = app.frameworks.length; 

    // callback checker, called if all frameworks are build. */
    that.callbackIfDone = function () {
      if (callback && that._frameworkCounter <= 0) {
        callback();
      };
    };

    that.prepareForServer = function () {
      app.frameworks.forEach(function (framework) {
        framework.prepareForServer(self.server, function () {
          that._frameworkCounter -= 1;
          that.callbackIfDone();
        });
      });
    };
  };

  console.log('\n');
  console.log(self.style.green('=== Server log:'));
  console.log('\n');

  new _AppPreparer(self, callback).prepareForServer();
};

/**
 * @description
 * Console logger that honors the configuration options mode and
 * debugLevel.
 *
 * If the mode is configured to "debug" and the debug level is less or
 * equal to the configured one, then any number of parameters that follows
 * the debug level parameter get printed with console.log().
 *
 * @param {number} debug level
 */
App.prototype.log = function (level) {
  if (this.mode === "debug" && level <= this.debugLevel) {
    var args = Array.prototype.slice.call(arguments, 1);
    return console.log.apply(this, args);
  };
};


App.prototype.addToPreloader = function(path){
    this.imagesToPreload.push(path);
};

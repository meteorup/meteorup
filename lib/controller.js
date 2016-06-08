var nodemiral = require('nodemiral');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var uuid = require('uuid');
var rimraf = require('rimraf');
var format = require('util').format;
var extend = require('util')._extend;
var _ = require('underscore');
var async = require('async');
var cjson = require('cjson');
var Config = require('./config');
var buildApp = require('./build.js');

require('colors');

module.exports = Actions;

function Actions(pwd, options) {
  this.pwd = pwd;
  this.options = options;
  // this.session = this._createSession();
}

// ================================================
// 创建一个 ssh 连接  ===============================
// ================================================
Actions.prototype._createPublicSession = function() {
  var host = "meteorup.cn";
  var auth = {
    username: "root",
    pem : fs.readFileSync(resolveHome("~/.ssh/id_rsa"), 'utf8')
  };
  var nodemiralOptions = {
    keepAlive: true
  };
  // console.log(auth);
  return nodemiral.session(host, auth, nodemiralOptions);
};
// ================================================
// 创建一个 ssh 连接
// ================================================
Actions.prototype._createPrivateSession = function(server) {
  var host = server.host;
  var auth = {
    username: server.username,
  };

  if(server.pem) {
    auth.pem = fs.readFileSync(server.pem, 'utf8');
  } else {
    auth.password = server.password;
  }

  var nodemiralOptions = {
    ssh: server.sshOptions,
    keepAlive: true
  };

  // console.log(auth);
  return nodemiral.session(host, auth, nodemiralOptions);
};

// ================================================
//  
// ================================================
Actions.prototype.deploy = function(appName) {
  var self = this;

  var buildLocation = path.resolve('/tmp', uuid.v4());
  var bundlePath = path.resolve(buildLocation, 'bundle.tar.gz');

  // spawn inherits env vars from process.env
  // so we can simply set them like this
  process.env.BUILD_LOCATION = buildLocation;

  var appPath = this.pwd;
  var buildOptions = this.options;
  var config = {appName : appName};

  console.log(('Started building ' + appName + " application").bold.blue);
  // console.info('Build path      : ' + buildLocation);
  buildApp(appPath, buildLocation, buildOptions, function(err) {
    if(err) {
      process.exit(1);
    } else {
      async.mapSeries(
        [self._createPublicSession()],
        function (session, callback) {
          var taskListsBuilder = require('./actions/deploy.js');
          
          var env = {};
          if (buildOptions.env) {
            var envPath = path.resolve(self.pwd, buildOptions.env);
            if (fs.existsSync(envPath)) {
              var setttingsJson = require(envPath);
              env = _.extend(env, setttingsJson);
            }
          }

          var taskList = taskListsBuilder.deploy(bundlePath, env, config);
          taskList.run(session, function (summaryMap) {
            callback(null, summaryMap);
          });
        },
        // function(){process.exit(0);}
        whenAfterDeployed(buildLocation)
      )
    }
  });
};


// ================================================
// 
// ================================================
Actions.prototype.setup = function() {
  var self = this;
  var packagePath = path.resolve(self.pwd, 'package.json');

  if (fs.existsSync(packagePath)) {
    var config = Config.setup(packagePath);
    // console.log(config);
    var appPath = this.pwd;

    // console.log(('Started installation server').bold.blue);
   
      async.mapSeries(
        [self._createPrivateSession(config.server)],
        function (session, callback) {
          var taskListsBuilder = require('./actions/setup.js');
          
          var taskList = taskListsBuilder.setup(config);
          taskList.run(session, function (summaryMap) {
            callback(null, summaryMap);
          });
        },
        whenAfterCompleted
      )
  }
};


// ================================================
//   push
// ================================================
Actions.prototype.push = function(appName) {
  var self = this;

  var buildLocation = path.resolve('/tmp', uuid.v4());
  var bundlePath = path.resolve(buildLocation, 'bundle.tar.gz');

  process.env.BUILD_LOCATION = buildLocation;

  var packagePath = path.resolve(self.pwd, 'package.json');

  if (fs.existsSync(packagePath)) {
    var config = Config.setup(packagePath);

    var appPath = this.pwd;
    var buildOptions = this.options;

    console.log(('Started building ' + config.deploy.appName + " application").bold.blue);
    buildApp(appPath, buildLocation, buildOptions, function(err) {
      if(err) {
        process.exit(1);
      } else {
        async.mapSeries(
          [self._createPrivateSession(config.server)],
          function (session, callback) {
            var taskListsBuilder = require('./actions/push.js');
            
            var taskList = taskListsBuilder.main(bundlePath, config.deploy.env, config);
            taskList.run(session, function (summaryMap) {
              callback(null, summaryMap);
            });
          },
          whenAfterDeployed(buildLocation)
        )
      }
    });
  }
};

// 找到用户目录 ~
function resolveHome(filepath) {
    if (filepath[0] === '~') {
        return path.join(process.env.HOME, filepath.slice(1));
    }
    return path;
}

// 任务完成时，删除临时文件
function whenAfterDeployed(buildLocation) {
  return function(error, summaryMaps) {
    rimraf.sync(buildLocation);
    whenAfterCompleted(error, summaryMaps);
  };
}

function whenAfterCompleted(error, summaryMaps) {
  var errorCode = error || haveSummaryMapsErrors(summaryMaps) ? 1 : 0;
  process.exit(errorCode);
}

function haveSummaryMapsErrors(summaryMaps) {
  return _.some(summaryMaps, hasSummaryMapErrors);
}

function hasSummaryMapErrors(summaryMap) {
  return _.some(summaryMap, function (summary) {
    return summary.error;
  })
}

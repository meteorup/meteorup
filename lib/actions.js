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
var buildApp = require('./build.js');

require('colors');

module.exports = Actions;

function Actions(pwd, options) {
  this.pwd = pwd;
  this.options = options;
  this.sessionsMap = this._createSessionsMap();
}

// 创建一个 ssh 连接
Actions.prototype._createSessionsMap = function() {
  var sessionsMap = {};

    var host = "meteorup.cn";

    var auth = {
      username: "root",
      pem : fs.readFileSync(resolveHome("~/.ssh/id_rsa"), 'utf8')
    };

    var nodemiralOptions = {
      keepAlive: true
    };

    sessionsMap = {
      taskListsBuilder:require('./actions/linux.js'),
      session: nodemiral.session(host, auth, nodemiralOptions)
    };

  return sessionsMap;
};


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

  console.log('Meteor build app path    : ' + appPath);
  // console.log('Using build location : ' + buildLocation);
  buildApp(appPath, buildLocation, buildOptions, function(err) {
    if(err) {
      process.exit(1);
    } else {
      async.mapSeries(
        [self.sessionsMap],
        function (sessionData, callback) {
          var session = sessionData.session;
          var taskListsBuilder = sessionData.taskListsBuilder;
          
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

function resolveHome(filepath) {
    if (filepath[0] === '~') {
        return path.join(process.env.HOME, filepath.slice(1));
    }
    return path;
}


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

var nodemiral = require('nodemiral');
var fs = require('fs');
var path = require('path');
var util = require('util');
var _ = require('underscore');

var SCRIPT_DIR = path.resolve(__dirname, '../../scripts/deploy');
var TEMPLATES_DIR = path.resolve(__dirname, '../../templates/deploy');
 

exports.deploy = function(bundlePath, env, config) {
  var deployCheckWaitTime = 15;
  var appName = config.appName;
  var privateKey = config.privateKey;
  var taskList = nodemiral.taskList("Deploy app '" + appName + "' (linux)");

  taskList.execute("Create Project Directory",
    {command: "mkdir -p /home/meteorup/" + appName + '/tmp/'});

  taskList.copy('Uploading bundle ' + bundlePath, {
    src: bundlePath,
    dest: '/home/meteorup/' + appName + '/tmp/bundle.tar.gz',
    progressBar: true
  });

  taskList.copy('Initializing start script', {
    src: path.resolve(TEMPLATES_DIR, 'app.json'),
    dest: '/home/meteorup/' + appName + '/app.json',
    vars: {
      appName: appName,
      env: env,
    }
  });

  deployAndVerify(taskList, appName, privateKey, deployCheckWaitTime);

  return taskList;
};
 
exports.restart = function(config) {
  var taskList = nodemiral.taskList("Restarting Application (linux)");

  var appName = config.appName;
  var port = config.env.PORT;
  var deployCheckWaitTime = config.deployCheckWaitTime;

  startAndVerify(taskList, appName, port, deployCheckWaitTime);

  return taskList;
};

exports.stop = function(config) {
  var taskList = nodemiral.taskList("Stopping Application (linux)");

  //stopping
  taskList.executeScript('Stopping app', {
    script: path.resolve(SCRIPT_DIR, 'stop.sh'),
    vars: {
      appName: config.appName
    }
  });

  return taskList;
};

exports.start = function(config) {
  var taskList = nodemiral.taskList("Starting Application (linux)");

  var appName = config.appName;
  var port = config.env.PORT;
  var deployCheckWaitTime = config.deployCheckWaitTime;

  startAndVerify(taskList, appName, port, deployCheckWaitTime);

  return taskList;
};


function startAndVerify(taskList, appName, port, deployCheckWaitTime) {
  taskList.execute('Starting app', {
    command: "bash /opt/" + appName + "/config/start.sh"
  });

  // verifying deployment
  taskList.executeScript('Verifying deployment', {
    script: path.resolve(SCRIPT_DIR, 'verify.sh'),
    vars: {
      deployCheckWaitTime: deployCheckWaitTime || 10,
      appName: appName,
      port: port
    }
  });
}

function deployAndVerify(taskList, appName, privateKey, deployCheckWaitTime) {
  // deploying
  taskList.executeScript('Invoking deployment process', {
    script: path.resolve(SCRIPT_DIR, 'deploy.sh'),
    vars: {
      appName: appName,
      privateKey: privateKey,
    }
  });

  // verifying deployment
  taskList.executeScript('Verifying deployment', {
    script: path.resolve(SCRIPT_DIR, 'verify.sh'),
    vars: {
      deployCheckWaitTime: 10,
      appName: appName,
    }
  });
}

var nodemiral = require('nodemiral');
var fs = require('fs');
var path = require('path');
var util = require('util');
var _ = require('underscore');

var SCRIPT_DIR = path.resolve(__dirname, '../../scripts/linux');
var TEMPLATES_DIR = path.resolve(__dirname, '../../templates/linux');
 

exports.deploy = function(bundlePath, env, config) {
  var deployCheckWaitTime = 15;
  var appName = config.appName;
  var taskList = nodemiral.taskList("Deploy app '" + appName + "' (linux)");

  taskList.execute("Create Project Directory",
    {command: "mkdir -p /usr/local/meteorup/" + appName + '/tmp/'});

  taskList.copy('Uploading bundle ' + bundlePath, {
    src: bundlePath,
    dest: '/usr/local/meteorup/' + appName + '/tmp/bundle.tar.gz',
    progressBar: true
  });

  // copyEnvVars(taskList, env, appName);

  taskList.copy('Initializing start script', {
    src: path.resolve(TEMPLATES_DIR, 'app.json'),
    dest: '/usr/local/meteorup/' + appName + '/app.json',
    vars: {
      appName: appName,
    }
  });

  deployAndVerify(taskList, appName, 0, deployCheckWaitTime);

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


function installStud(taskList) {
  taskList.executeScript('Installing Stud', {
    script: path.resolve(SCRIPT_DIR, 'install-stud.sh')
  });
}

function copyEnvVars(taskList, env, appName) {
  var env = _.clone(env);
  // sending PORT to the docker container is useless.
  // It'll run on PORT 80 and we can't override it
  // Changing the port is done via the start.sh script
  delete env.PORT;
  taskList.copy('Sending environment variables', {
    src: path.resolve(TEMPLATES_DIR, 'env.list'),
    dest: '/opt/' + appName + '/config/env.list',
    vars: {
      env: env || {},
      appName: appName
    }
  });
}

function startAndVerify(taskList, appName, port, deployCheckWaitTime) {
  taskList.execute('Starting app', {
    command: "bash /opt/" + appName + "/config/start.sh"
  });

  // verifying deployment
  taskList.executeScript('Verifying deployment', {
    script: path.resolve(SCRIPT_DIR, 'verify-deployment.sh'),
    vars: {
      deployCheckWaitTime: deployCheckWaitTime || 10,
      appName: appName,
      port: port
    }
  });
}

function deployAndVerify(taskList, appName, port, deployCheckWaitTime) {
  // deploying
  taskList.executeScript('Invoking deployment process', {
    script: path.resolve(SCRIPT_DIR, 'deploy.sh'),
    vars: {
      appName: appName
    }
  });

  // verifying deployment
  taskList.executeScript('Verifying deployment', {
    script: path.resolve(SCRIPT_DIR, 'verify-deployment.sh'),
    vars: {
      deployCheckWaitTime: 10,
      appName: appName,
    }
  }, function(err){
    say("I'm finished.");
  });
}

function verify(taskList, appName, port, deployCheckWaitTime) {

  // verifying deployment
  taskList.executeScript('Verifying deployment', {
    script: path.resolve(SCRIPT_DIR, 'verify-deployment.sh'),
    vars: {
      deployCheckWaitTime: deployCheckWaitTime || 10,
      appName: appName,
      port: port
    }
  }, function(err){
    say("I'm finished.");
  });
}

function escapeshell(cmd) { //http://stackoverflow.com/a/7685469
  return '"'+cmd.replace(/(["\s'$`\\])/g,'\\$1')+'"';
};

function say(string)
{
  var os = require('os');
  if (os.type() == 'Darwin')
  {
    var exec = require('child_process').exec;
    exec("say " + escapeshell(string), function(error, stdout, stderr)
    {
      console.log(stderr);
    });
  }
}
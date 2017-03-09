var nodemiral = require('nodemiral');
var fs = require('fs');
var path = require('path');
var util = require('util');
var _ = require('underscore');
var SCRIPT_DIR = path.resolve(__dirname, '../../scripts/setup');
var TEMPLATES_DIR = path.resolve(__dirname, '../../templates/setup');
exports.reconfig = function(config) {
    var taskList = nodemiral.taskList('Reconfig ' + config.appName + ' application');
    var appName = config.appName;
    var rootPath = config.setup.path;

    //重新生成启动脚本并上传: app.json
    taskList.copy('Initializing start script', {
        src: path.resolve(TEMPLATES_DIR, 'app.json'),
        dest: rootPath + appName + '/app.json',
        vars: {
            appName: appName,
            env: config.deploy.env,
            rootPath: rootPath,
        }
    });

    // 用pm2重新启动应用
    taskList.executeScript('Reconfig app.json', {
        script: path.resolve(SCRIPT_DIR, 'reconfig.sh'),
        vars: {
            appName: config.appName,
            rootPath: config.setup.path，
            rootPort：config.deploy.env.PORT
        }
    });

    return taskList;
};

var nodemiral = require('nodemiral');
var fs = require('fs');
var path = require('path');
var util = require('util');
var _ = require('underscore');
var SCRIPT_DIR = path.resolve(__dirname, '../../scripts/setup');
var TEMPLATES_DIR = path.resolve(__dirname, '../../templates/setup');
exports.setup = function(config) {
    var taskList = nodemiral.taskList('Setup (linux)');
    // 初始化环境建目录和用户
    taskList.executeScript('Setting up Environment', {
        script: path.resolve(SCRIPT_DIR, 'setup-env.sh'),
        vars: {
            appName: config.deploy.appName,
            rootPath: config.setup.path
        }
    });
    taskList.executeScript('Installing gcc++ and make', {
        script: path.resolve(SCRIPT_DIR, 'install-init.sh')
    });
    // if(config.setup.docker) {
    //   // 需要安装docker
    //   taskList.executeScript('Installing Docker', {
    //     script: path.resolve(SCRIPT_DIR, 'install-docker.sh')
    //   });
    // }else{
    // }
    // // 不安装docker ，就需要安装nodejs 和 nvm
    taskList.executeScript('Installing NVM', {
        script: path.resolve(SCRIPT_DIR, 'install-nvm.sh')
    });
    taskList.executeScript('Installing Nodejs', {
        script: path.resolve(SCRIPT_DIR, 'install-nodejs.sh')
    });
    taskList.executeScript('Installing PM2', {
        script: path.resolve(SCRIPT_DIR, 'install-pm2.sh')
    });
    if (config.setup.mongo) {
        taskList.executeScript('Installing MongoDB', {
            script: path.resolve(SCRIPT_DIR, 'install-mongodb.sh')
        });
    }
    return taskList;
};

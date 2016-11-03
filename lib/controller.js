var _ = require('underscore');
var fs = require('fs');
var ora = require('ora');
var path = require('path');
var exec = require('executive');
var uuid = require('uuid');
var async = require('async');
var rimraf = require('rimraf');
var nodemiral = require('nodemiral');
//
var Config = require('./config');
var build = require('./build');
//
global.notification = "finished";
module.exports = Actions;
//
function Actions(pwd, options) {
    this.pwd = pwd;
    this.options = options;
}
// ================================================
// 创建一个 ssh 连接
// ================================================
Actions.prototype._createPrivateSession = function(server) {
    var host = server.host;
    var auth = {
        username: server.username,
    };
    if (server.pem) {
        auth.pem = fs.readFileSync(server.pem, 'utf8');
    } else {
        auth.password = server.password;
    }
    var nodemiralOptions = {
        ssh: server.sshOptions,
        keepAlive: true
    };
    return nodemiral.session(host, auth, nodemiralOptions);
};
// ================================================
//  deploy
// ================================================
Actions.prototype.deploy = function(appName, privateKey) {
    var self = this;
    var appPath = this.pwd;
    var buildOptions = this.options;
    var deploy = require('./actions/deploy');
    var spinner = ora({
        spinner: 'dots2'
    });
    var params = {
        appName: appName,
        appPath: appPath,
        buildOptions: buildOptions,
        spinner: spinner,
        privateKey: privateKey,
    }
    console.log(('Started building ' + appName + " application.").bold.blue);
    async.waterfall([
        function(done) {
            done(null, params);
        },
        build.build,
        build.archive,
        deploy.upload
    ], function(err, params) {
        if (err) {
            params.spinner.text = err.message;
            params.spinner.fail()
            whenAfterDeployed(params.buildLocaltion)(err);
        } else {
            params.spinner.text = '[meteorup.cn]'.magenta + ' - ' + params.appName + ' Project Deployment Is Successful';
            params.spinner.succeed()
            console.log(('visit to http://' + params.appName + '.meteorup.cn'));
            whenAfterDeployed(params.buildLocaltion)(0);
        }
    });
};
// ================================================
// setup
// ================================================
Actions.prototype.setup = function() {
    var packagePath = path.resolve(this.pwd, 'package.json');
    if (fs.existsSync(packagePath)) {
        var config = Config.setup(packagePath);
        var session = this._createPrivateSession(config.server);
        var appPath = this.pwd;
        async.waterfall([
            function(callback) {
                var taskListsBuilder = require('./actions/setup.js');
                var taskList = taskListsBuilder.setup(config);
                taskList.run(session, function(summaryMap) {
                    callback(null, null, summaryMap);
                });
            },
        ], whenAfterCompleted);
    } else {
        console.log(('configuration file does not exist! ' + packagePath).bold.red);
    }
};
// ================================================
//   push
// ================================================
Actions.prototype.push = function(appName) {
    var packagePath = path.resolve(this.pwd, 'package.json');
    if (fs.existsSync(packagePath)) {
        var config = Config.setup(packagePath);
        var appPath = this.pwd;
        var buildOptions = this.options;
        var session = this._createPrivateSession(config.server);
        var spinner = ora({
            spinner: 'dots2'
        });
        var params = {
            appName: appName,
            appPath: appPath,
            buildOptions: buildOptions,
            spinner: spinner,
        }
        console.log(('Started building ' + config.deploy.appName + " application.").bold.blue);
        async.waterfall([
            function(done) {
                done(null, params);
            },
            build.build,
            build.archive,
            function(params, done) {
                var bundlePath = path.resolve(params.buildLocaltion, 'bundle.tar.gz');
                var taskListsBuilder = require('./actions/push.js');
                var taskList = taskListsBuilder.main(bundlePath, config, buildOptions);
                taskList.run(session, function(summaryMap) {
                    done(null, null, summaryMap);
                });
            },
        ], whenAfterCompleted);
    } else {
        console.log(('configuration file does not exist! ' + packagePath).bold.red);
    }
};
// ================================================
//   logs
// ================================================
Actions.prototype.logs = function(appName) {
    var packagePath = path.resolve(this.pwd, 'package.json');
    if (fs.existsSync(packagePath)) {
        var config = Config.setup(packagePath);
        var session = this._createPrivateSession(config.server);
        console.log(('[' + config.server.host + ']').magenta + (' - Print the log of ' + config.deploy.appName + ' project.').bold.blue);
        async.waterfall([
            function(done) {
                var SCRIPT_DIR = path.resolve(__dirname, '../scripts/logs');
                var hostPrefix = '[' + session._host + '] ';
                var options = {
                    onStdout: function(data) {
                        process.stdout.write(data.toString());
                    },
                    onStderr: function(data) {
                        process.stderr.write(data.toString());
                    },
                    vars: {
                        appName: config.deploy.appName
                    }
                };
                var command = path.resolve(SCRIPT_DIR, 'logs.sh');
                session.executeScript(command, options, done);
            },
        ], whenAfterCompleted);
    } else {
        console.log(('configuration file does not exist! ' + packagePath).bold.red);
    }
};
// // ================================================
// //   mongo
// // ================================================
// Actions.prototype.mongo = function(appName) {
//     var self = this;
//     var packagePath = path.resolve(self.pwd, 'package.json');
//     if (fs.existsSync(packagePath)) {
//         var config = Config.setup(packagePath);
//         var mongourl = config.deploy.env.MONGO_URL;
//         var port = /:(\d+)\//.exec(mongourl)[1];
//         var db = mongourl.substring(mongourl.lastIndexOf('/') + 1);
//         var host = /(2[0-4][0-9]|25[0-5] |1[0-9][0-9]|[1-9]?[0-9])(\.(2[0-4][0-9]|25[0-5] |1[0-9][0-9]|[1-9]?[0-9])){3}/.exec(mongourl)[0];
//         host = (host == 'localhost' || host == '127.0.0.1') ? config.server.host : host;
//         var executable = ["mongo", "--host", host, '--port', port, db];
//         console.info(('[' + config.server.host + ']').magenta + (' - Connection to a remote mongo database.').bold.blue);
//         console.log(executable.join(' ').bold.blue);
//         exec.interactive(executable.join(' '), function(err) {
//             whenAfterCompleted(err);
//         });
//     } else {
//         console.log(('configuration file does not exist! ' + packagePath).bold.red);
//     }
// };
// ================================================
//   test
// ================================================
// Actions.prototype.test = function(appName) {
//     var self = this;
//     var packagePath = path.resolve(self.pwd, 'package.json');
//     if (fs.existsSync(packagePath)) {
//         var config = Config.setup(packagePath);
//         async.series([function(callback) {
//             var SCRIPT_DIR = path.resolve(__dirname, '../scripts/push');
//             var session = self._createPrivateSession(config.server);
//             var hostPrefix = '[' + session._host + '] ';
//             var options = {
//                 onStdout: function(data) {
//                     process.stdout.write(hostPrefix + data.toString());
//                 },
//                 onStderr: function(data) {
//                     process.stderr.write(hostPrefix + data.toString());
//                 }
//             };
//             // var command = "curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh | bash && . ~/.bashrc && env && nvm --version";
//             // session.execute( command, options, callback );
//             var command = path.resolve(SCRIPT_DIR, 'verify.sh');
//             console.log(command);
//             session.executeScript(command, options, callback);
//         }], whenAfterCompleted);
//     } else {
//         console.log(('configuration file does not exist! ' + packagePath).bold.red);
//     }
// };
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
    if (errorCode) {
        say('error');
    } else {
        say(global.notification);
    }
    process.exit(errorCode);
}

function haveSummaryMapsErrors(summaryMaps) {
    return _.some(summaryMaps, hasSummaryMapErrors);
}

function hasSummaryMapErrors(summaryMap) {
    return _.some(summaryMap, function(summary) {
        return summary && summary.error;
    })
}

function escapeshell(cmd) {
    //http://stackoverflow.com/a/7685469
    return '"' + cmd.replace(/(["\s'$`\\])/g, '\\$1') + '"';
};

function say(string) {
    var os = require('os');
    if (os.type() == 'Darwin') {
        exec("say " + escapeshell(string));
    }
}

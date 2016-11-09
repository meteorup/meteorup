var _ = require('underscore');
var fs = require('fs');
var ora = require('ora');
var exec = require('executive');
var async = require('async');
var build = require('./build');
var colors = require('colors');
var rimraf = require('rimraf');
global.notification = "finished";
module.exports = Actions;
//
function Actions(pwd, options) {
    this.pwd = pwd;
    this.options = options;
}
// ================================================
//  deploy
// ================================================
Actions.prototype.deploy = function(appName, privateKey) {
    var appPath = this.pwd;
    var buildOptions = this.options;
    var deploy = require('./deploy');
    var spinner = ora({
        spinner: {
            "interval": 80,
            "frames": ["⣷", "⣯", "⣟", "⡿", "⢿", "⣻", "⣽", "⣾"]
        }
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
        deploy.check,
        build.build,
        build.archive,
        deploy.upload,
        deploy.startup,
        deploy.watch,
    ], function(err, params) {
        if (err) {
            params.spinner.text = err.message;
            params.spinner.fail()
            console.log(err);
            say('error');
        } else {
            params.spinner.text = '[meteorup.cn]'.magenta + ' - ' + params.appName + ' Project Deployment Is Successful';
            params.spinner.succeed()
            console.log(('visit to http://' + params.appName + '.meteorup.cn'));
            say(global.notification);
        }
        whenAfterDeployed(params.buildLocaltion);
    });
};
// 任务完成时，删除临时文件
function whenAfterDeployed(buildLocation) {
    if (fs.existsSync(buildLocation)) rimraf.sync(buildLocation);
    process.exit();
}

function say(string) {
    var os = require('os');
    if (os.type() == 'Darwin') {
        exec("say " + escapeshell(string));
    }
}

function escapeshell(cmd) {
    //http://stackoverflow.com/a/7685469
    return '"' + cmd.replace(/(["\s'$`\\])/g, '\\$1') + '"';
};

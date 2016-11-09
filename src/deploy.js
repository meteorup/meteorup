var fs = require('fs');
var path = require('path');
var async = require('async');
var config = require('./config');
var request = require('request');
var ProgressBar = require('progress');
// ====================================================
//     测试项目和key
// ====================================================
exports.check = function(params, done) {
    params.spinner.text = '[meteorup.cn]'.magenta + ' - Authentication Project ' + params.appName;
    params.spinner.start();
    //
    var url = config.url() + 'deploy/check/' + params.appName + '/' + params.privateKey;
    //
    request.post({
      url:url,
      encoding: 'utf8'
    }).on('data', function(chunk) {
      if (chunk == 'success') {
        params.spinner.text = '[meteorup.cn]'.magenta + ' - Authentication Project ' + params.appName;
        params.spinner.succeed();
        done(null, params);
      } else {
        done(new Error(chunk), params);
      }
    }).on('error', function(err) {
      done(err, params);
    });
  }
  // ====================================================
  //     上传文件
  // ====================================================
exports.upload = function(params, done) {
    var bundlePath = path.resolve(params.buildLocaltion, 'bundle.tar.gz');
    //
    var url = config.url() + 'deploy/upload/' + params.appName + '/' + params.privateKey;
    //
    var req = request.post(url, function(err, res, body) {
      if (err) {
        done(err);
      } else {
        if (body == 'success') {
          params.spinner.text = '[meteorup.cn]'.magenta + ' - Upload Project ';
          params.spinner.succeed();
          done(null, params);
        } else {
          done(new Error(body), params);
        }
      }
    });
    //
    var form = req.form();
    // form.append('name', params.appName);
    // form.append('key', params.privateKey);
    form.append('archive', fs.createReadStream(bundlePath));
    form.getLength(function(err, size) {
      bar = new ProgressBar('  [meteorup.cn]'.magenta + ' - Upload Project [:bar] :percent :etas', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: size,
        clear: true
      });
    });
    form.on('data', function(chunk) {
      bar && bar.tick(chunk.length);
    });
  }
  // ====================================================
  //     启动项目
  // ====================================================
exports.startup = function(params, done) {
    params.spinner.text = '[meteorup.cn]'.magenta + ' - Startup Project ' + params.appName;
    params.spinner.start();
    //
    var url = config.url() + 'deploy/startup/' + params.appName + '/' + params.privateKey;
    //
    request.post({
      url:url,
      encoding: 'utf8',
    }).on('data', function(chunk) {
      if (chunk == 'success') {
        params.spinner.text = '[meteorup.cn]'.magenta + ' - Startup Project ' + params.appName;
        params.spinner.succeed();
        done(null, params);
      } else {
        done(new Error(chunk), params);
      }
    }).on('error', function(err) {
      done(err, params);
    });
  }
  // ====================================================
  //     watch
  // ====================================================
exports.watch = function(params, done) {
  params.spinner.text = '[meteorup.cn]'.magenta + ' - Verifying Project ' + params.appName;
  params.spinner.start();
  //
  var url = config.url() + 'deploy/watch/' + params.appName + '/' + params.privateKey;
  //
  async.detectSeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(item, callback) {
    // =================
    sleep(1000);
    request.post({
      url:url,
      encoding: 'utf8',
    }, function(err, httpResponse, body) {
      if (body == 'Running') {
        callback(true);
      }
    });
    // ================
  }, function(result) {
    // ====================================================
    //     超时，获取 pod 状态
    // ====================================================
    if (result) {
      params.spinner.succeed();
      done(null, params);
    } else {
      url = config.url() + 'deploy/logs/' + params.appName + '/' + params.privateKey;
      request.post({
        url:url,
        encoding: 'utf8',
      }).on('data', function(chunk) {
        done(new Error(chunk), params);
      });
    }
  });
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}

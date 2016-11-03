var fs = require('fs');
var path = require('path');
var request = require('request');
var ProgressBar = require('progress');
// ====================================================
//     this
// ====================================================
exports.upload = function(params, done) {
  var bundlePath = path.resolve(params.buildLocaltion, 'bundle.tar.gz');
  var total = uploaded = 0;
  var url = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/upload' : 'http://www.meteorup.cn/upload';
  var req = request.post(url, function(err, res) {
    if (err) {
      done(err);
    } else {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      params.spinner.text = '[meteorup.cn]'.magenta + ' - Upload Project ';
      params.spinner.succeed();
      done(null, params);
    }
  });
  var form = req.form();
  form.append('key', params.privateKey);
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

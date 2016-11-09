var fs = require('fs');
var path = require('path');
var uuid = require('uuid');
var spawn = require('child_process').spawn;
var archiver = require('archiver');
// ====================================================
//     this
// ====================================================
exports.build = function(params, done) {
    var buildLocaltion = path.resolve('/tmp', uuid.v4());
    // var bundlePath = path.resolve(buildLocaltion, 'bundle.tar.gz');
    //
    params.buildLocaltion = buildLocaltion;
    // console.log('  [meteorup.cn]'.magenta + ' - Build Project ' + params.appPath);
    params.spinner.text = '[meteorup.cn]'.magenta + ' - Build Project ' + params.appPath;
    params.spinner.start();
    //
    var executable = "meteor";
    var args = ["build", "--directory", buildLocaltion, "--architecture", "os.linux.x86_64", ];
    if (params.buildOptions.serverOnly) {
      args.push("--server-only");
    }
    if (params.buildOptions.debug) {
      args.push("--debug");
    }
    if (params.buildOptions.mobileSettings) {
      args.push('--mobile-settings');
      args.push(JSON.stringify(params.buildOptions.mobileSettings));
    }
    var options = {
      cwd: params.appPath
    };
    // var meteorBuild = spawn("mkdir", ["-p",buildLocaltion+"/bundle"], options);
    var meteorBuild = spawn(executable, args, options);
    // var stdout = "";
    // var stderr = "";
    meteorBuild.stdout.pipe(process.stdout, {
      end: false
    });
    meteorBuild.stderr.pipe(process.stderr, {
      end: false
    });
    meteorBuild.on('close', function() {
      params.spinner.succeed();
      done(null, params);
    });
  }
  // ====================================================
  //     this
  // ====================================================
exports.archive = function(params, done) {
  var bundlePath = path.resolve(params.buildLocaltion, 'bundle.tar.gz');
  var sourceDir = path.resolve(params.buildLocaltion, 'bundle');
  var output = fs.createWriteStream(bundlePath);
  var archive = archiver('tar', {
    gzip: true,
    gzipOptions: {
      level: 6,
      checkpoint: 100,
      "checkpoint-action": "dot",
      totals: true
    }
  });
  archive.on('entry', function() {
    params.spinner.text = '[meteorup.cn]'.magenta + ' - Archive Project ' + sourceDir + ' by ' + archive.pointer() + ' bytes';
  });
  output.once('close', function() {
    params.spinner.text = '[meteorup.cn]'.magenta + ' - Archive Project ' + bundlePath;
    params.spinner.succeed();
    done(null, params);
  });
  archive.once('error', function(err) {
    done(err);
  });
  params.spinner.start();
  archive.pipe(output);
  archive.directory(sourceDir, 'bundle').finalize();
}

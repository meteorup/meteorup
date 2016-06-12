var spawn = require('child_process').spawn;
var archiver = require('archiver');
var fs = require('fs');
var pathResolve = require('path').resolve;
var _ = require('underscore');
var ProgressBar = require('progress');

module.exports = buildApp;
// 打包meteor应用
function buildApp(appPath, buildLocaltion, buildOptions, callback) {
  buildMeteorApp(appPath, buildLocaltion, buildOptions, function(code) {
    if(code == 0) {
      archiveIt(buildLocaltion, callback);
    } else {
      console.log("\n=> Build Error. Check the logs printed above.");
      callback(new Error("build-error"));
    }
  });
}

function buildMeteorApp(appPath, buildLocaltion, buildOptions, callback) {
  var executable = "meteor";
  var args = [
    "build", "--directory", buildLocaltion, 
    "--architecture", "os.linux.x86_64",
  ];
  // "--server", "http://localhost:3000", 

  if (buildOptions.serverOnly) {
    args.push("--server-only");
  }

  if(buildOptions.debug) {
    args.push("--debug");
  }

  if(buildOptions.mobileSettings) {
    args.push('--mobile-settings');
    args.push(JSON.stringify(buildOptions.mobileSettings));
  }
  
  console.info('[meteorup]'.magenta + ' - Meteor app path ' + appPath);
  var options = {cwd: appPath};
  // var meteor = spawn("mkdir", ["-p",buildLocaltion+"/bundle"], options);
  var meteor = spawn(executable, args, options);
  var stdout = "";
  var stderr = "";

  meteor.stdout.pipe(process.stdout, {end: false});
  meteor.stderr.pipe(process.stderr, {end: false});

  meteor.on('close', callback);
}

function archiveIt(buildLocaltion, callback) {
  callback = _.once(callback);
  var bundlePath = pathResolve(buildLocaltion, 'bundle.tar.gz');
  var sourceDir = pathResolve(buildLocaltion, 'bundle');

  // var states = fs.statSync(bundlePath);
  var output = fs.createWriteStream(bundlePath);
  var archive = archiver('tar', {
    gzip: true,
    gzipOptions: {
      level: 6,
      checkpoint:100,
      "checkpoint-action": "dot",
      totals: true
    }
  });


  archive.on('entry', function() {
    process.stdout.cursorTo(0);
    process.stdout.write('Compressing by ' + archive.pointer() + ' bytes');
    process.stdout.clearLine(1);
  });

  archive.pipe(output);

  output.once('close', function(){
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    callback();
  });

  archive.once('error', function(err) {
    console.log("=> Archiving failed:", err.message);
    callback(err);
  });
  console.log('[meteorup]'.magenta + ' - Tar file path ' + sourceDir);
  archive.directory(sourceDir, 'bundle').finalize();
}


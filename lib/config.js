var cjson = require('cjson');
var path = require('path');
var fs = require('fs');
var format = require('util').format;
require('colors');

exports.setup = function(configFileName) {

 

  var packageJson = cjson.load(configFileName);
  // 检查server节点的信息
  checkServer(packageJson.server);
  // 检查服务器配置信息
  checkSetup(packageJson.setup);
  // 检查部署配置信息
  checkDeploy(packageJson.deploy);
  
  if (packageJson.notice) {
    global.notification = packageJson.notice;
  }

  return packageJson;
  

  function checkDeploy(configJson){
    // console.log(server);
    //validating servers
    if(!configJson) {
      errorLog('Server path information does not exist');
    } else {

        if(!configJson.appName) {
          errorLog('Application name does not exist');
        }
        if(!configJson.env) {
          errorLog('Configure environment does not exist');
        }  

        if (packageJson.setup.docker) {
          if(!configJson.dockerImage) {
            errorLog('Docker image does not exist');
          }  
        }
        
    }
  }

  function checkSetup(configJson){
    // console.log(server);
    //validating servers
    if(!configJson) {
      errorLog('Server path information does not exist');
    } else {

        if(!configJson.path) {
          errorLog('Server path does not exist');
        }
        if(!/.*\/$/g.test(configJson.path)) {
          configJson.path = configJson.path + '/';
        }
        // console.log(configJson.path);
        // console.log(/^\/(usr|opt)\//g.test(configJson.path));
        if (!(/^\/(usr|opt|home|alidata)\//.test(configJson.path))){
          errorLog('Server path must in /usr /opt /home /alidata directory');
        }
    }
  }

  function checkServer(server){
    // console.log(server);
    //validating servers
    if(!server) {
      errorLog('Server information does not exist');
    } else {

        if(!server.host) {
          errorLog('Server host does not exist');
        } else if(!server.username) {
          errorLog('Server username does not exist');
        } else if(!server.password && !server.pem) {
          errorLog('Server password, pem or a ssh agent does not exist');
        } 

        if(server.pem) {
          server.pem =
            rewritePath(server.pem, "SSH private key file is invalid");
        }

        server.sshOptions = server.sshOptions || {};
    }
  }
  // 检查目录是否存在
  function rewritePath(location, errorMessage) {
    if(!location) {
      return errorLog(errorMessage);
    }
    
    var homeLocation = process.env.HOME;

    var location = location.replace('~', homeLocation).trim();
      // anyway, we need to resolve path for windows compatibility
    location = path.resolve(location);
    if(!fs.existsSync(location)) {
      errorLog(errorMessage);
    }

    return location;
  }
  // 报错
  function errorLog(message) {
    var errorMessage = 'Invalid configuration file ' + configFileName + ': ' + message;
    console.error(errorMessage.red.bold);
    process.exit(1);
  }


};


// ============================================================================
// ============================================================================

 
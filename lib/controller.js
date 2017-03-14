var nodemiral = require( 'nodemiral' );
var path = require( 'path' );
var fs = require( 'fs' );
// var exec = require( 'child_process' ).exec;
var exec = require( 'executive' );
var spawn = require( 'child_process' ).spawn;
var uuid = require( 'uuid' );
var rimraf = require( 'rimraf' );
var format = require( 'util' ).format;
var extend = require( 'util' )._extend;
var _ = require( 'underscore' );
var async = require( 'async' );
var cjson = require( 'cjson' );
var Config = require( './config' );
var buildApp = require( './build.js' );
require( 'colors' );
module.exports = Actions;
global.notification = "finished";

function Actions( pwd, options ) {
    this.pwd = pwd;
    this.options = options;
    var packagePath = path.resolve( this.pwd, 'meteorup.json' );
    if(!fs.existsSync( packagePath )) {
      throw new Error( ('configuration file does not exist!' + packagePath).bold.red );
    }
    this.config = Config.setup( packagePath );
}

// ================================================
// 创建一个 ssh 连接  ===============================
// ================================================
Actions.prototype._createPublicSession = function() {
    var host = "meteorup.cn";
    var auth = {
        username: "www",
        pem: fs.readFileSync( resolveHome( "~/.ssh/id_rsa" ), 'utf8' )
    };
    var nodemiralOptions = {
        keepAlive: true
    };
    // console.log(auth);
    return nodemiral.session( host, auth, nodemiralOptions );
};
// ================================================
// 创建一个 ssh 连接
// ================================================
Actions.prototype._createPrivateSession = function( server ) {
    var host = server.host;
    var auth = {
        username: server.username,
    };
    if ( server.pem ) {
        auth.pem = fs.readFileSync( server.pem, 'utf8' );
    } else {
        auth.password = server.password;
    }
    var nodemiralOptions = {
        ssh: server.sshOptions,
        keepAlive: true
    };
    // console.log(auth);
    return nodemiral.session( host, auth, nodemiralOptions );
};
// ================================================
//  deploy
// ================================================
Actions.prototype.deploy = function( appName , privateKey) {
    var self = this;
    var buildLocation = path.resolve( '/tmp', uuid.v4() );
    var bundlePath = path.resolve( buildLocation, 'bundle.tar.gz' );

    var appPath = this.config.appPath;
    var buildOptions = this.options;
    var config = {
        appName: appName,
        privateKey: privateKey
    };
    console.log( ( 'Started building ' + appName + " application." ).bold.blue );

    buildApp( appPath, buildLocation, buildOptions, function( err ) {
        if ( err ) {
            process.exit( 1 );
        } else {
            async.mapSeries(
                [ self._createPublicSession() ],
                function( session, callback ) {
                    var taskListsBuilder = require( './actions/deploy.js' );
                    var env = {};
                    if ( buildOptions.env ) {
                        var envPath = path.resolve( self.pwd, buildOptions.env );
                        if ( fs.existsSync( envPath ) ) {
                            var setttingsJson = require( envPath );
                            env = _.extend( env, setttingsJson );
                        }
                    }
                    var taskList = taskListsBuilder.deploy( bundlePath, env, config );
                    taskList.run( session, function( summaryMap ) {
                        callback( null, summaryMap );
                    } );
                },
                // function(){process.exit(0);}
                whenAfterDeployed( buildLocation ) )
        }
    } );
};
// ================================================
// setup
// ================================================
Actions.prototype.setup = function() {
    var appPath = this.config.appPath;
    var self = this;
    // console.log(('Started installation server').bold.blue);
    async.mapSeries(
        [ self._createPrivateSession( self.config.server ) ],
        function( session, callback ) {
            var taskListsBuilder = require( './actions/setup.js' );
            var taskList = taskListsBuilder.setup( config );
            taskList.run( session, function( summaryMap ) {
                callback( null, summaryMap );
            } );
        }, whenAfterCompleted );
};
// ================================================
//   push
// ================================================
Actions.prototype.push = function( ) {
    var self = this;
    var buildLocation = path.resolve( '/tmp', uuid.v4() );
    var bundlePath = path.resolve( buildLocation, 'bundle.tar.gz' );
    process.env.BUILD_LOCATION = buildLocation;

    var config = this.config;
    var appPath = this.config.appPath;
    var buildOptions = this.options;
    config.deploy.env = _.extend(config.deploy.env, {
      METEOR_SETTINGS: JSON.stringify(require(path.resolve(this.path, 'settings.json')))
    });
    // console.log(buildOptions);
    console.log( ( 'Started building ' + config.appName + " application." ).bold.blue );
    buildApp( appPath, buildLocation, buildOptions, function( err ) {
        if ( err ) {
            process.exit( 1 );
        } else {
            async.mapSeries(
                [ self._createPrivateSession( config.server ) ],
                function( session, callback ) {
                    var taskListsBuilder = require( './actions/push.js' );
                    var taskList = taskListsBuilder.main( bundlePath, config, buildOptions);
                    taskList.run( session, function( summaryMap ) {
                        callback( null, summaryMap );
                    } );
                }, whenAfterDeployed( buildLocation ) );
        }
    } );
};

// ================================================
//   reconfig
// ================================================
Actions.prototype.reconfig = function(){
  var self = this;
  var config = this.config;
  config.deploy.env = _.extend(config.deploy.env, {
    METEOR_SETTINGS: JSON.stringify(require(path.resolve(this.path, 'settings.json')))
  });
  async.mapSeries(
      [ self._createPrivateSession( self.config.server ) ],
      function( session, callback ) {
          var taskListsBuilder = require( './actions/reconfig.js' );
          var taskList = taskListsBuilder.setup( config );
          taskList.run( session, function( summaryMap ) {
              callback( null, summaryMap );
          } );
      }, whenAfterCompleted );
}

// ================================================
//   logs
// ================================================
Actions.prototype.logs = function( ) {
    var self = this;
    var config = this.config;
    async.mapSeries(
        [ self._createPrivateSession( config.server ) ],
        function( session, callback ) {
            console.log( ( '[' + config.server.host + ']' ).magenta + ( ' - Print the log of ' + config.appName + ' project.' ).bold.blue );

            var SCRIPT_DIR = path.resolve(__dirname, '../scripts/logs');
            var hostPrefix = '[' + session._host + '] ';
            var options = {
                onStdout: function( data ) {
                    process.stdout.write(data.toString() );
                },
                onStderr: function( data ) {
                    process.stderr.write( data.toString() );
                },
                vars: {
                    appName: config.appName
                }
            };
            var command = path.resolve(SCRIPT_DIR, 'logs.sh');
            session.executeScript( command, options, callback );
        }, whenAfterCompleted );
};
// ================================================
//   mongo
// ================================================
Actions.prototype.mongo = function( ) {
  var config = this.config;
  var mongourl = config.deploy.env.MONGO_URL;
  var port = /:(\d+)\//.exec( mongourl )[ 1 ];
  var db = mongourl.substring( mongourl.lastIndexOf( '/' ) + 1 );
  var host = /(2[0-4][0-9]|25[0-5] |1[0-9][0-9]|[1-9]?[0-9])(\.(2[0-4][0-9]|25[0-5] |1[0-9][0-9]|[1-9]?[0-9])){3}/.exec( mongourl )[ 0 ];
  host = ( host == 'localhost' || host == '127.0.0.1' ) ? config.server.host : host;
  var executable = [ "mongo", "--host", host, '--port', port, db ];
  console.info( ( '[' + config.server.host + ']' ).magenta + ( ' - Connection to a remote mongo database.' ).bold.blue );
  console.log( executable.join( ' ' ).bold.blue );
  exec.interactive( executable.join( ' ' ), function( err ) {
      whenAfterCompleted(err);
  } );
};
// ================================================
//   test
// ================================================
Actions.prototype.test = function( ) {
  var config = this.config;
  var self = this;
  async.series( [function( callback ) {
      var SCRIPT_DIR = path.resolve(__dirname, '../scripts/push');
      var session = self._createPrivateSession( config.server );
      var hostPrefix = '[' + session._host + '] ';
      var options = {
          onStdout: function( data ) {
              process.stdout.write( hostPrefix + data.toString() );
          },
          onStderr: function( data ) {
              process.stderr.write( hostPrefix + data.toString() );
          }
      };
      // var command = "curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh | bash && . ~/.bashrc && env && nvm --version";
      // session.execute( command, options, callback );

      var command = path.resolve(SCRIPT_DIR, 'verify.sh');
      console.log(command);
      session.executeScript( command, options, callback );
  }], whenAfterCompleted );
};
// 找到用户目录 ~
function resolveHome( filepath ) {
    if ( filepath[ 0 ] === '~' ) {
        return path.join( process.env.HOME, filepath.slice( 1 ) );
    }
    return path;
}
// 任务完成时，删除临时文件
function whenAfterDeployed( buildLocation ) {
    return function( error, summaryMaps ) {
        rimraf.sync( buildLocation );
        whenAfterCompleted( error, summaryMaps );
    };
}

function whenAfterCompleted( error, summaryMaps ) {
    var errorCode = error || haveSummaryMapsErrors( summaryMaps ) ? 1 : 0;
    say( global.notification );
    process.exit( errorCode );
}

function haveSummaryMapsErrors( summaryMaps ) {
    return _.some( summaryMaps, hasSummaryMapErrors );
}

function hasSummaryMapErrors( summaryMap ) {
    return _.some( summaryMap, function( summary ) {
        return summary.error;
    } )
}

function escapeshell( cmd ) {
    //http://stackoverflow.com/a/7685469
    return '"' + cmd.replace( /(["\s'$`\\])/g, '\\$1' ) + '"';
};

function say( string ) {
    var os = require( 'os' );
    if ( os.type() == 'Darwin' ) {
        exec( "say " + escapeshell( string ) );
    }
}

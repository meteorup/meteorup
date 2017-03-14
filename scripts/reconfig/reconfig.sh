#!/bin/bash

 set -x
set -e

## check nvm
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"
. /etc/profile

APP_DIR=<%=rootPath %><%=appName %>

cd $APP_DIR
node --version
echo "=> Reconfig meteor on <%=appName %>"

### export METEOR_SETTINGS
if [ -f settings.json ]; then
  export METEOR_SETTINGS=`cat settings.json`
fi

pm2 stop app.json
sleep 1

listen=`netstat -na|grep ':<%=rootPort%> '|grep LISTEN| awk '{print $6}'`
if [ "$listen"x == "LISTEN"x ]; then
    echo ""
    echo "Port <%=rootPort%> has been occupied."
    echo ""
    exit 1
else
    pm2 start app.json
fi

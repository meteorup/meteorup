#!/bin/bash

# set -x
set -e

APP_DIR=<%=rootPath %><%=appName %>
cd $APP_DIR
node --version
echo "=> Reconfig meteor on <%=appName %>"

pm2 stop app.json -s
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

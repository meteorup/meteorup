#!/bin/bash

# set -x
set -e
shopt -s expand_aliases

## check nvm 
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"

. /etc/profile

APP_DIR=<%=rootPath %><%=appName %>
DATE=`date '+%Y%m%d%H%M%S'`

# save the last known version
cd $APP_DIR
if [[ -d current ]]; then
  # mv current/bundle last$DATE
  cp -Rf current last$DATE
else
  mkdir current
fi

mv tmp/bundle.tar.gz current/

cd current/
tar xzf bundle.tar.gz
rm -Rf bundle.tar.gz
cd bundle/programs/server/

sed -i 's/"resolved.*,/"!!":"",/g' npm-shrinkwrap.json
sed -i 's/"resolved.*"/"!!":""/g' npm-shrinkwrap.json
alias cnpm="npm --registry=https://registry.npm.taobao.org --cache=$HOME/.npm/.cache/cnpm --disturl=https://npm.taobao.org/dist --userconfig=$HOME/.cnpmrc"
cnpm install

## fix bcrypt bug
# cd npm/node_modules/meteor/npm-bcrypt/node_modules/bcrypt/
# node-gyp rebuild

cd $APP_DIR
node --version
echo "=> Deploy meteor on <%=appName %>"

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


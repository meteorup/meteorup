#!/bin/bash
set -e

## check nvm 
if [ -z "$NVM_DIR" ]; then
  NVM_DIR="$HOME/.nvm"
fi

[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

alias npm="npm --registry=https://registry.npm.taobao.org \
--cache=$HOME/.npm/.cache/cnpm \
--disturl=https://npm.taobao.org/dist \
--userconfig=$HOME/.cnpmrc"

APP_DIR=<%=rootPath %><%=appName %>
DATE=`date '+%Y%m%d%H%M%S'`

# save the last known version
cd $APP_DIR
if [[ -d current ]]; then
  sudo cp -Rf current last$DATE
fi

# setup the new version
if [[ ! -d current ]]; then
  sudo mkdir current
fi

sudo mv tmp/bundle.tar.gz current/

cd current/
tar xzf bundle.tar.gz
rm -Rf bundle.tar.gz
cd bundle/programs/server/
npm install

cd $APP_DIR
node --version
echo "=> Deploy meteor on <%=appName %>"
pm2 start app.json
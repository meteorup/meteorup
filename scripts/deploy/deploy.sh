#!/bin/bash
set -x
set -e
shopt -s expand_aliases

METEOR_PORT=`~/bin/generateNodePort <%=appName %>`

if [[ '$METEOR_PORT' == '' ]]; then
  echo "Not Port"
  exit 1;
fi

alias cnpm="npm --registry=https://registry.npm.taobao.org \
--cache=$HOME/.npm/.cache/cnpm \
--disturl=https://npm.taobao.org/dist \
--userconfig=$HOME/.cnpmrc"

APP_DIR=/usr/local/meteorup/<%=appName %>
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
cnpm install

echo "=> Deploy meteor on <%=appName %>.meteorup.cn"
node --version
cd $APP_DIR
sed -i 's/PORT10000/'$METEOR_PORT'/g' app.json
~/.nvm/v0.10.45/bin/pm2 start app.json
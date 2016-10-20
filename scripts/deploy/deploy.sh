#!/bin/bash

# set -x
set -e
shopt -s expand_aliases

## check nvm 
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"

APP_DIR=/home/meteorup/<%=appName %>
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

cd $APP_DIR

# METEOR_PORT=`~/bin/generateNodePort <%=appName %>`
METEOR_PORT=`curl "http://www.meteorup.cn/api?name=<%=appName %>&key=<%=privateKey%>"`

if [[ '$METEOR_PORT' == '' ]]; then
  echo "Not permission, please visit http://www.meteorup.cn"
  exit 1;
fi
METEOR_PORT_LEN=`echo $METEOR_PORT | awk '{print length($0)}'`

if [ 4 -lt $METEOR_PORT_LEN ]; then
  echo "${METEOR_PORT}, please visit http://www.meteorup.cn"
  exit 1;
fi

# sed -i 's/PORT10000/'$METEOR_PORT'/g' app.json

echo "=> Deploy meteor on <%=appName %>.meteorup.cn"

~/.nvm/v0.10.45/bin/pm2 start app.json

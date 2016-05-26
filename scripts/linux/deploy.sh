#!/bin/bash
set -e

GPORT=`~/bin/generateNodePort <%=appName %>`

if [[ '$GPORT' == '' ]]; then
  echo "Not Port"
  exit 1;
fi

alias npm="npm --registry=https://registry.npm.taobao.org \
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
npm install

##tar zxvf /opt/fibers-1.0.10.tar.gz -C /opt/<%= appName %>/current/
# cp -Rf /opt/run_app.sh /opt/<%= appName %>/current/
# We temporarly stopped the binary building
# Instead we are building for linux 64 from locally
# That's just like what meteor do
# We can have option to turn binary building later on, 
# but not now
# start app
# sudo bash config/start.sh
# 
# Honour already existing PORT setup
# export PORT=${PORT:-80}
# echo "$ROOT_URL"
echo "=> Deploy meteor on <%=appName %>.yijianapp.com"
node --version
cd $APP_DIR
sed -i 's/13000/'$GPORT'/g' app.json
~/.nvm/v0.10.45/bin/pm2 start app.json
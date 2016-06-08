set -e
alias npm="npm --registry=https://registry.npm.taobao.org \
--cache=$HOME/.npm/.cache/cnpm \
--disturl=https://npm.taobao.org/dist \
--userconfig=$HOME/.cnpmrc"

if [ -d /bundle ]; then
  cd /bundle
  tar xzf *.tar.gz
  if [ -d /bundle/fibers ]; then
    mkdir -p /bundle/bundle/programs/server/node_modules/
    cp -Rf /bundle/fibers /bundle/bundle/programs/server/node_modules/
  else
    cd /bundle/bundle/programs/server/
    npm install fibers@1.0.10 
  fi
  cd /bundle/bundle/programs/server/
  npm install
  
  cd /bundle/bundle/
elif [[ $BUNDLE_URL ]]; then
  cd /tmp
  curl -L -o bundle.tar.gz $BUNDLE_URL
  tar xzf bundle.tar.gz
  cd /tmp/bundle/programs/server/
  npm i
  cd /tmp/bundle/
elif [ -d /built_app ]; then
  cd /built_app
else
  echo "=> You don't have an meteor app to run in this image."
  exit 1
fi

if [[ $REBUILD_NPM_MODULES ]]; then
  if [ -f /opt/meteord/rebuild_npm_modules.sh ]; then
    cd programs/server
    bash /opt/meteord/rebuild_npm_modules.sh
    cd ../../
  else
    echo "=> Use meteorhacks/meteord:bin-build for binary bulding."
    exit 1
  fi
fi

# Set a delay to wait to start meteor container
if [[ $DELAY ]]; then
  echo "Delaying startup for $DELAY seconds"
  sleep $DELAY
fi

# Honour already existing PORT setup
export PORT=${PORT:-80}
echo "$ROOT_URL"
echo "=> Starting meteor app on port:$PORT"
node main.js

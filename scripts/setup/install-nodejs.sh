#!/bin/bash

# set -x 
set -e

nvm_has() {
  type "$1" > /dev/null 2>&1
}

## check nvm 
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"
## use taobao mirror server
export NVM_NODEJS_ORG_MIRROR=https://npm.taobao.org/mirrors/node
export NVM_IOJS_ORG_MIRROR=http://npm.taobao.org/mirrors/iojs
## check node
# NODE_VERSION='v0.10.45'
NODE_VERSION='v4.4.7'
if nvm_has "node" ; then
    version=`node --version`;
    if [[ "$version"x != "$NODE_VERSION"x ]]; then
        echo "install node $NODE_VERSION"
        nvm install $NODE_VERSION
        nvm alias default $NODE_VERSION
        nvm use $NODE_VERSION
    fi
else
    echo "install node"
    nvm install $NODE_VERSION
    nvm alias default $NODE_VERSION
    nvm use $NODE_VERSION
fi

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
if nvm_has "node" ; then
    version=`node --version`;
    if [[ "$version"x != "v0.10.45"x ]]; then
        echo "install node v0.10.45"
        nvm install v0.10.45
        nvm alias default v0.10.45
        nvm use v0.10.45
    fi
else
    echo "install node"
    nvm install v0.10.45
    nvm alias default v0.10.45
    nvm use v0.10.45
fi

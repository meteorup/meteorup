#!/bin/bash

set -x 
set -e


## check nvm 
if [ -z "$NVM_DIR" ]; then
  NVM_DIR="$HOME/.nvm"
fi

[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

## check node
if [ -e "node" ]; then
    if [ `node --version` == 'v0.10.45' ]; then
        nvm install v0.10.45
        nvm alias default v0.10.45
        nvm use v0.10.45
    fi
else
    nvm install v0.10.45
    nvm alias default v0.10.45
    nvm use v0.10.45
fi

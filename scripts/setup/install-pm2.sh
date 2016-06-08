#!/bin/bash

set -x 
set -e


## check nvm 
if [ -z "$NVM_DIR" ]; then
  NVM_DIR="$HOME/.nvm"
fi

[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

## check pm2
if [ ! -e "pm2" ]; then
    npm install -g pm2
fi

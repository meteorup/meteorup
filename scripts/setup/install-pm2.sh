#!/bin/bash

# set -x 
set -e
shopt -s expand_aliases

nvm_has() {
  type "$1" > /dev/null 2>&1
}

## check nvm 
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"

alias cnpm="npm --registry=https://registry.npm.taobao.org --cache=$HOME/.npm/.cache/cnpm --disturl=https://npm.taobao.org/dist --userconfig=$HOME/.cnpmrc"

## check pm2
if nvm_has "pm2" ; then
	echo 'pm2 is already installed'
else
    cnpm install -g pm2
fi

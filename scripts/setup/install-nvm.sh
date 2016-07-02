#!/bin/bash

# set -x 
set -e

nvm_has() {
  type "$1" > /dev/null 2>&1
}

## check nvm 
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"
if nvm_has "nvm"; then
    echo 'nvm is already installed'
else
    if nvm_has "curl"; then
        curl -o- 'http://git.oschina.net/romejiang/nvm/raw/master/install.sh' | NVM_SOURCE='http://git.oschina.net/romejiang/nvm/raw/master' bash
    elif nvm_has "wget"; then
        wget -qO- 'http://git.oschina.net/romejiang/nvm/raw/master/install.sh' | NVM_SOURCE='http://git.oschina.net/romejiang/nvm/raw/master' bash
    fi
fi

# [ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"

# nvm --version
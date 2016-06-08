#!/bin/bash

set -x 
set -e

ARCH=$(uname -m | sed 's/x86_//;s/i[3-6]86/32/')

if [ -f /etc/lsb-release ]; then
    OS=`lsb_release -i | grep 'Distributor ID'| awk '{print $3}'`
    VER=`lsb_release -r | grep 'Release'| awk '{print $2}'`
elif [ -f /etc/debian_version ]; then
    OS=Debian
    VER=$(cat /etc/debian_version)
elif [ -f /etc/redhat-release ]; then
    OS=CentOS  
    VER=$(cat /etc/redhat-release)
else
    OS=$(uname -s)
    VER=$(uname -r)
fi

case $(uname -m) in
x86_64)
    BITS=64
    ;;
i*86)
    BITS=32
    ;;
*)
    BITS=
    ;;
esac


## install curl 
if [ "$OS" == "CentOS" ]; then
    echo "CentOS"
    sudo yum -y install curl
    sudo yum -y install net-tools
    sudo yum -y install gcc-c++
elif [ "$OS" == "Ubuntu" ]; then
    echo "Ubuntu"
    sudo apt-get -y install curl
    sudo apt-get -y install g++ 
else
    echo "Other"
fi

## check nvm 
if [ -z "$NVM_DIR" ]; then
  NVM_DIR="$HOME/.nvm"
fi

if [ ! -d "$NVM_DIR" ]; then
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh | bash
fi

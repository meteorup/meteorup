#!/bin/bash

# set -x 
set -e

## install make curl
ARCH=$(uname -m | sed 's/x86_//;s/i[3-6]86/32/')

if [ -f /etc/lsb-release ]; then
    OS=`lsb_release -a | grep 'Distributor ID'| awk '{print $3}'`
    VER=`lsb_release -a | grep 'Release'| awk '{print $2}'`
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

if [ "$OS" == "CentOS" ]; then
    echo "CentOS"
    yum -y install gcc-c++ make net-tools curl
elif [ "$OS" == "Ubuntu" ]; then
    echo "Ubuntu"
    apt-get -y install curl make g++  
fi

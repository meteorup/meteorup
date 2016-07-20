#!/bin/bash

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


# Is docker already installed?
set +e
haveDocker=$(docker version | grep "version")
set -e

if [ ! "$haveDocker" ]; then

	## install curl 
	if [ "$OS" == "CentOS" ]; then
	    echo "CentOS"
	    yum -y install curl
	    # Install docker
		curl -fsSL https://get.docker.com/ | sh
		sleep 3
		service docker start

	elif [ "$OS" == "Ubuntu" ]; then
	    echo "Ubuntu"
	    apt-get install curl
	    # Install docker
		curl -fsSL https://get.docker.com/ | sh
	else
	    echo "Other"
	fi
	
fi

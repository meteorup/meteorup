#!/bin/bash

# set -x 
set -e

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


listen=`netstat -na|grep ':27017 '|grep LISTEN| awk '{print $6}'`

if [ "$listen"x == "LISTEN"x ]; then
	echo "mongodb is exist."
   	exit
fi

if [ "$OS" == "CentOS" ]; then
    echo "CentOS"
    cat >/etc/yum.repos.d/mongodb-org-3.2.repo <<EOL
[mongodb-org-3.2]
name=MongoDB Repository
baseurl=http://mirrors.aliyun.com/mongodb/yum/redhat/\$releasever/mongodb-org/3.2/x86_64/
gpgcheck=0
enabled=1
EOL

    yum install -y mongodb-org
    chkconfig mongod on

    sleep 1
    mongod -f /etc/mongod.conf &
    

elif [ "$OS" == "Ubuntu" ]; then
    echo "Ubuntu"
    
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys D68FA50FEA312927

    if [ "$VER" == "14.04" ]; then
    	
    	echo "deb http://mirrors.aliyun.com/mongodb/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list

	elif [ "$VER" == "12.04" ]; then

		echo "deb http://mirrors.aliyun.com/mongodb/apt/ubuntu precise/mongodb-org/3.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list

	fi

	DEBIAN_FRONTEND=noninteractive apt-get update
	DEBIAN_FRONTEND=noninteractive apt-get install -y mongodb-org

	sleep 1
    mongod -f /etc/mongod.conf &

else
    echo "Other"
fi

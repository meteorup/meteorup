#!/bin/bash

set -x 
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




listen=`netstat -na|grep 27017|grep LISTEN| awk '{print $6}'`

if [ -n "$listen" ]; then
	echo "mongodb is exist."
   	exit
fi

if [ "$OS" == "CentOS" ]; then
    echo "CentOS"
    sudo cat >/etc/yum.repos.d/mongodb-org-3.2.repo <<EOL
[mongodb-org-3.2]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/3.2/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-3.2.asc
EOL

    sudo yum install -y mongodb-org
    sudo chkconfig mongod on

    sleep 3
    # sudo service mongod start
    mongod -f /etc/mongod.conf &
    

elif [ "$OS" == "Ubuntu" ]; then
    echo "Ubuntu"
    # export LC_ALL=C
    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
    if [ "$VER" == "14.04" ]; then
    	
    	echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list

	elif [ "$VER" == "12.04" ]; then

		echo "deb http://repo.mongodb.org/apt/ubuntu precise/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list

	fi

	sudo DEBIAN_FRONTEND=noninteractive apt-get update
	sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mongodb-org

    # mkdir -p /data/db
	sleep 3
    # sudo service mongod start
    mongod -f /etc/mongod.conf &

else
    echo "Other"
fi


# we use this data directory for the backward compatibility
# older mup uses mongodb from apt-get and they used this data directory
# sudo mkdir -p /var/lib/mongodb

# sudo docker pull mongo:latest
# set +e
# sudo docker rm -f mongodb
# set -e

# sudo docker run \
#   -d \
#   --restart=always \
#   --publish=127.0.0.1:27017:27017 \
#   --volume=/var/lib/mongodb:/data/db \
#   --volume=/opt/mongodb/mongodb.conf:/mongodb.conf \
#   --name=mongodb \
#   mongo mongod -f /mongodb.conf
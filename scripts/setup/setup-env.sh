#!/bin/bash

set -x

sudo mkdir -p <%= rootPath %><%= appName %>/
sudo mkdir -p <%= rootPath %><%= appName %>/config
sudo mkdir -p <%= rootPath %><%= appName %>/tmp
sudo mkdir -p <%= rootPath %>mongodb

sudo chown ${USER} <%= rootPath %><%= appName %> -R
sudo chown ${USER} <%= rootPath %>mongodb -R

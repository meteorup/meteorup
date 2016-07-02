#!/bin/bash

set -x
set -e

mkdir -p <%= rootPath %><%= appName %>/
mkdir -p <%= rootPath %><%= appName %>/config
mkdir -p <%= rootPath %><%= appName %>/tmp
mkdir -p <%= rootPath %>mongodb

chown ${USER} <%= rootPath %><%= appName %> -R
chown ${USER} <%= rootPath %>mongodb -R

#!/bin/bash

# set -x
set -e

APPNAME=<%= appName %>

LOGFILE=`pm2 show $APPNAME|grep 'out log path'|awk '{print $6}'`

if [ "$LOGFILE"x != ""x ];then
  echo "tail -n 50 "$LOGFILE
  echo ""
  tail -n 50 "$LOGFILE"
  echo ""
fi

 

#!/bin/bash

# set -x
set -e

## check nvm
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"

. /etc/profile

APPNAME=<%= appName %>

LOGFILE=`pm2 show $APPNAME|grep 'out log path'|awk '{print $6}'`

FLUSH=<%= flush %>

if [ "$LOGFILE"x == ""x ];then
  echo "Not found logfile: $LOGFILE"
  exit 0
fi

if [ $FLUSH ];then
  echo "tail -f $LOGFILE"
  tail -f "$LOGFILE"
else
  echo "tail -n 50 "$LOGFILE
  echo ""
  tail -n 50 "$LOGFILE"
  echo ""
fi

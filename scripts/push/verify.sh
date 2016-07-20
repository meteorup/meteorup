#!/bin/bash

# set -x
set -e

APPNAME=<%= appName %>
DEPLOY_CHECK_WAIT_TIME=<%= deployCheckWaitTime %>

revert_app (){
  LOGFILE=`pm2 show $APPNAME|grep 'out log path'|awk '{print $6}'`
  if [ "$LOGFILE"x != ""x ];then
    tail -n 50  "$LOGFILE"
    echo ""
    echo "To see more logs type 'meteorup logs'"
    echo ""
  fi
  echo "Unable to access <%=rootURL %>"
}

elaspsed=0
while [[ true ]]; do
  elaspsed=$((elaspsed+1))
  curl <%=rootURL %> && exit 0
  sleep 1

  if [ "$elaspsed" == "$DEPLOY_CHECK_WAIT_TIME" ]; then
    revert_app
    exit 1
  fi
done

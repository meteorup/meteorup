APPNAME=<%= appName %>
DEPLOY_CHECK_WAIT_TIME=<%= deployCheckWaitTime %>
APP_DIR=/usr/local/meteorup/<%=appName %>

cd $APP_DIR

revert_app (){
  ~/.nvm/v0.10.45/bin/pm2 logs $APPNAME 1>&2
  echo 
  echo "To see more logs type 'mup logs --tail=50'"
  echo ""
}

elaspsed=0
while [[ true ]]; do
  elaspsed=$((elaspsed+1))
  curl $APPNAME.yijianapp.com && exit 0
  sleep 1

  if [ "$elaspsed" == "$DEPLOY_CHECK_WAIT_TIME" ]; then
    revert_app
    exit 0
  fi
done

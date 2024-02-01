#!/usr/bin/env bash

WORKING_DIRECTORY="~/www/cs1531deploy"

USERNAME="t15adream"
SSH_HOST="ssh-t15adream.alwaysdata.net"

scp -r ./package.json ./package-lock.json ./tsconfig.json ./src ./imgurl "$USERNAME@$SSH_HOST:$WORKING_DIRECTORY"
ssh "$USERNAME@$SSH_HOST" "cd $WORKING_DIRECTORY && npm install --omit=dev"

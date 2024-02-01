#!/bin/sh

if [ $1 -ne 2 ] && [ $1 -ne 3 ]
then
    echo 'ERROR: The frontend only works for iterations 2 or 3'
    echo 'Usage: bash run.sh [ITERATION] [BACKEND PORT] [FRONTEND PORT]'
    exit 1
fi

echo "REACT_APP_ITERATION=$1" > .env
echo "REACT_APP_BACKEND_PORT=$2" >> .env
echo "PORT=$3" >> .env
npm run start-react


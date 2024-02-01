#!/bin/sh

if [ $1 -ne 2 ] && [ $1 -ne 3 ]
then
    echo 'ERROR: The frontend only works for iterations 2 or 3'
    echo 'Usage: bash run-easy.sh [ITERATION] [BACKEND PORT]'
    exit 1
fi

echo "var ITERATION = '$1'" > build/config.js
echo "var BACKEND_PORT = '$2'" >> build/config.js
echo "var DEPLOYED_URL = 'https://example.alwaysdata.net'" >> build/config.js

npx serve -s build
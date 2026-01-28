#!/usr/bin/env bash
cd "$(dirname "$0")"
export NODE_ENV=development
nohup node index.js > /tmp/astermed-server.log 2>&1 &
echo $!

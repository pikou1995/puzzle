#!/bin/sh

rm -f /etc/nginx/sites-enabled/puzzle.conf

git pull
npm install && npm run build
cp -a puzzle.conf /etc/nginx/sites-enabled/

nginx -s reload

#!/bin/bash

rm -rf node_modules/restful-redux/lib/*
cd ../..
npm run build
cp -rf lib examples/01-github-profile-viewer/node_modules/restful-redux

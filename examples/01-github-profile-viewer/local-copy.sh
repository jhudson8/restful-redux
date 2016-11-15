#!/bin/bash

rm -rf node_modules/react-redux-model/lib/*
cd ../..
npm run build
cp -rf lib/* examples/01-github-profile-viewer/node_modules/react-redux-model/lib

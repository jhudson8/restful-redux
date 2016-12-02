#!/bin/bash

rm -rf node_modules/react-redux-model/lib/*
cd ../..
npm run build
cp -rf lib/* examples/05-normalizr-github-paged-profile-search-and-viewer/node_modules/react-redux-model/lib

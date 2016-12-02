#!/bin/bash

rm -rf node_modules/react-redux-model/lib/*
cd ../..
npm run build
cp -rf lib examples/04-normalizr-github-paged-project-search/node_modules/react-redux-model

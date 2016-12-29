#!/bin/bash

rm -rf node_modules/restful-redux/lib/*
cd ../..
npm run build
cp -rf lib examples/05-normalizr-github-paged-project-search-and-viewer/node_modules/restful-redux

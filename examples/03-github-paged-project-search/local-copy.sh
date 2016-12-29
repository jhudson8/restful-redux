#!/bin/bash

rm -rf node_modules/restful-redux/lib/*
cd ../..
npm run build
cp -rf lib examples/03-github-paged-project-search/node_modules/restful-redux

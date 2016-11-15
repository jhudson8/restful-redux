#!/bin/bash

rm -rf node_modules/redux-model-util/lib/*
cd ../..
npm run build
cp -rf lib/* examples/simple-fetch-with-redux-effects/node_modules/redux-model-util/lib

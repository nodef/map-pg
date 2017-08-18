#!/bin/bash
node test
err=$?
if [[ ${err} != 0 ]]; then exit ${err}; fi
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc
npm publish

#!/bin/bash

# Android

npx react-native bundle \
    --platform android \
    --dev false \
    --entry-file tests/instrumental/app/index.js \
    --bundle-output android/src/androidTest/assets/bundled_app.bundle

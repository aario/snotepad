#!/bin/bash
mode=release

if [ "x$1" == 'xdebug' ]; then
    mode=debug
fi

adb install ./app/build/outputs/apk/$mode/app-$mode.apk
adb shell monkey -p info.aario.snotepad -c android.intent.category.LAUNCHER 1

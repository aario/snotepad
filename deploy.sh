#!/bin/bash
mode=release

if [ "x$1" == 'xdebug' ]; then
    mode=debug
    shift
fi

if [ "x$1" == 'xuninstall' ]; then
    adb uninstall info.aario.snotepad
fi

adb install ./app/build/outputs/apk/$mode/app-$mode.apk
adb shell monkey -p info.aario.snotepad -c android.intent.category.LAUNCHER 1

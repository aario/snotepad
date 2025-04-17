#to build:
#   docker build -t wsn-builder .
mode=Release

if [ "x$1" == 'xdebug' ]; then
    mode=Debug
fi

docker run \
    -ti \
    --rm \
    -v $(pwd):/workspace \
    -v $(pwd)/.gradle-home:/root/.gradle \
    -w /workspace \
    wsn-builder \
    /bin/bash -c '
        source ./keystore.env \
        && ./gradlew clean :app:assemble'"$mode"' \
        '
find ./app/build -name '*.apk' -exec ls -l {} \;
echo Done.
echo 'Run deploy.sh [debug] script to deploy on your android phone using adb and a usb cable.'

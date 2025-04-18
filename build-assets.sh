#to build:
#   docker build -t wsn-builder .

gulpCommand=build
if [ "x$1" == 'xwatch' ]; then
    gulpCommand=watch
fi

docker run \
    -ti \
    --rm \
    -v $(pwd):/workspace \
    -v $(pwd)/.gradle-home:/root/.gradle \
    -w /workspace/html \
    wsn-builder \
    /bin/bash -c '
        npm install \
	&& gulp clean \
        && gulp '"$gulpCommand"' \
        '

echo 'Run build.sh [debug] script to build the apk file.'

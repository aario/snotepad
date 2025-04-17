#to build:
#   docker build -t wsn-builder .

docker run \
    -ti \
    --rm \
    -v $(pwd):/workspace \
    -v $(pwd)/.gradle-home:/root/.gradle \
    -w /workspace/html \
    wsn-builder \
    /bin/bash -c '
        npm install \
        && gulp build \
        '

echo 'Run build.sh [debug] script to build the apk file.'

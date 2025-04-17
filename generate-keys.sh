#!/bin/bash

set -e

echo -n 'Company name: '; read COMPANY_NAME
echo -n 'Organization name: '; read ORGANIZATION_NAME
echo -n 'Organization: '; read ORGANIZATION
echo -n 'City: '; read CITY
echo -n 'Stage: '; read STATE
echo -n 'Country Code: '; read COUNTRY_CODE
echo -n 'Key Password: '; read PASSWORD
echo -n 'Key Alias: '; read ALIAS

keytool \
    -genkeypair \
    -v \
    -keystore keystore.jks \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=$COMPANY_NAME, OU=$ORGANIZATION_NAME, O=$ORGANIZATION, L=$CITY, S=$STATE, C=$COUNTRY_CODE" \
    -storepass "$PASSWORD" \
    -keypass "$PASSWORD" \
    -alias "$ALIAS"

echo "export KEYSTORE_FILE='/workspace/keystore.jks'" > keystore.env
echo "export KEYSTORE_PASSWORD='$PASSWORD'" >> keystore.env
echo "export KEY_PASSWORD='$PASSWORD'" >> keystore.env
echo "export KEY_ALIAS='$ALIAS'" >> keystore.env

echo 'Files created:'
ls -l keystore.jks
ls -l keystore.env

echo 'Done.'

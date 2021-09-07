#!/usr/bin/env bash

docker volume create ranger_mongo_data

docker run --rm --name ranger-api-mongo -p 27017:27017 -v ranger_mongo_data:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=admin-user \
  -e MONGO_INITDB_ROOT_PASSWORD=test \
  -d mongo:4.2.5

#!/usr/bin/env bash

docker volume create ranger_postgres_data

docker container rm ranger-api-timescaledb

docker run -d --name ranger-api-timescaledb -p 5432:5432 -v ranger_postgres_data:/var/lib/postgresql/data \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=test \
  timescale/timescaledb:latest-pg12

docker exec -it ranger-api-timescaledb psql -U postgres --command "create schema if not exists sequelize;"

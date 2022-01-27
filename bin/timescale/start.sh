#!/usr/bin/env bash

docker volume create guardian_postgres_data

docker container rm guardian-api-timescaledb

docker run -d --name guardian-api-timescaledb -p 5432:5432 -v guardian_postgres_data:/var/lib/postgresql/data \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=test \
  timescale/timescaledb:latest-pg12

docker exec -it guardian-api-timescaledb psql -U postgres --command "create schema if not exists sequelize;"

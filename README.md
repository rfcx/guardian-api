# RFCx Ranger API

Manages reports produced by Rangers. Consumed by [Ranger app](https://github.com/rfcx/ranger-android) and [Incident Center app](https://github.com/rfcx/incident-center)

---

## Getting started

Requirements:
- Node 14.17.6 (can be installed via `nvm` module and `.nvmrc` file)
- yarn
- MongoDb

### Basics

#### Install dependencies

```sh
yarn
```

#### Configure env variables

Copy `.env.example` to `.env`. Set DB credentials there.

### Setup TimescaleDB locally using Docker

Start TimescaleDB container

```sh
yarn start.timescale
```

Run the migrations

On local machine (to apply env vars from `.env` file)
```sh
yarn migrate.dev
```

When you want to stop TimescaleDB
```sh
yarn stop.timescale
```

#### Run local dev server (live reload)

```sh
yarn serve
```

### Testing

#### Run lint:
```sh
yarn lint
```

#### Run tests:
```
yarn test
```

---

## More information

- [Deployment](./build/README.md)

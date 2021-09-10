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

#### Start local MongoDB using Docker.
```sh
yarn start.mongo
```
MongoDB will start on `localhost` with port `27017`, db name `admin`, user `admin-user`, and password `test`.

(When you want to stop MongoDB, use:)
```sh
yarn stop.mongo
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

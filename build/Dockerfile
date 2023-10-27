FROM node:20.9.0 AS builder
WORKDIR /build
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile
COPY . .
RUN yarn build

FROM node:20.9.0 as guardian-api
RUN apt-get update && apt-get install -y ffmpeg
ENV CACHE_DIRECTORY="/tmp/guardian-api/"
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --production --frozen-lockfile
COPY --from=builder /build/admin ./admin
COPY --from=builder /build/migrations ./migrations
COPY --from=builder /build/dist ./dist
EXPOSE 3000
CMD yarn start

FROM jrottenberg/ffmpeg:3.3-alpine
FROM node:14.17.6-alpine AS builder

WORKDIR /build
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

COPY . .
RUN yarn build

FROM node:14.17.6-alpine

COPY --from=0 / /
ENV CACHE_DIRECTORY="/tmp/guardian-api/"
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --production --frozen-lockfile
COPY --from=builder /build/admin ./admin
COPY --from=builder /build/migrations ./migrations
COPY --from=builder /build/dist ./dist
EXPOSE 3000
CMD yarn start

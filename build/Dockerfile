FROM node:14.17.6-alpine AS builder
WORKDIR /build
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile
COPY . .
RUN yarn build

FROM node:14.17.6-stretch as guardian-api
#RUN apt-get update && apt-get install -y libav-tools ffmpeg
RUN echo "deb http://archive.debian.org/debian stretch main" > /etc/apt/sources.list
RUN apt-get -y update && apt-get -y upgrade && apt list --upgradable 
RUN apt-get install ffmpeg
ENV CACHE_DIRECTORY="/tmp/guardian-api/"
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --production --frozen-lockfile
COPY --from=builder /build/admin ./admin
COPY --from=builder /build/migrations ./migrations
COPY --from=builder /build/dist ./dist
EXPOSE 3000
CMD yarn start

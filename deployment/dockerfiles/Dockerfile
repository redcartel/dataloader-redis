FROM node:20.11-alpine

WORKDIR /app

COPY . .

RUN yarn set version stable
RUN yarn
RUN yarn build
RUN yarn backend:build

ENV PACKAGE_NAME="backend-gateway"

ENTRYPOINT node ./packages/${PACKAGE_NAME}/dist/index.js
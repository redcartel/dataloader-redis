FROM node:20.11-alpine

WORKDIR /app

COPY package.json ./package.json
COPY . .

RUN yarn set version stable
RUN yarn
RUN yarn workspace data-resources pnpify prisma generate
RUN yarn build
RUN yarn backend:build

ENV PACKAGE_NAME=backend_gateway

ENTRYPOINT node ./packages/${PACKAGE_NAME}/dist/index.js
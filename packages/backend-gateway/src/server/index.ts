import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { yogaPlugins } from "../middleware/yoga-plugins";
import { contextFactory } from "../context";
import { makePostgresConnection } from "data-resources/src/postgres-connection";
import { makeRedisConnection } from "data-resources/src/redis-connection";
import { createYoga } from "graphql-yoga";
import { schemaFactory } from "../schema-loader";
import { config } from "common-values";

export const postgres = makePostgresConnection();

export const redis = makeRedisConnection();

export const gatewayApp = createYoga({
  schema: schemaFactory,
  maskedErrors: config.isProd,
  plugins: yogaPlugins,
  context: contextFactory(redis, postgres),
  graphiql: config.isDev,
  logging: config.isProd ? "warn" : "debug",
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['POST']
  }
});

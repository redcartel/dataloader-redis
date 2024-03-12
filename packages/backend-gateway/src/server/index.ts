import { yogaPlugins } from "../middleware/yoga-plugins";
import { contextFactory } from "../context";
import { makeRedisConnection } from "data-resources/src/redis-connection";
import { createYoga } from "graphql-yoga";
import { currentSchema } from "../schema-loader";
import { config } from "common-values";
import { PrismaClient } from "data-resources/src/generated/prismaClient";

export const client = new PrismaClient();

export const redis = makeRedisConnection();

export const gatewayApp = createYoga({
  schema: currentSchema,
  maskedErrors: config.isProd,
  plugins: yogaPlugins,
  context: contextFactory(redis, client),
  graphiql: config.isDev,
  logging: config.isProd ? "warn" : "debug",
  cors: {
    origin: config.frontend.url,
    credentials: true,
    methods: ["POST"],
  },
});

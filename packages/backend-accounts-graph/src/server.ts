import { createYoga } from "graphql-yoga";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { accountsSchema } from "./schema.graphql";
import { resolvers } from "./resolvers";
import { accountsPlugins } from "./middleware";
import { contextFactory } from "./context";
import { makePostgresConnection } from "data-resources/src/postgres-connection";
import { makeRedisConnection } from "data-resources/src/redis-connection";
import { GraphQLResolverMap } from "@apollo/subgraph/dist/schema-helper";
import express from "express";
import cookieParser from "cookie-parser";
import { PrismaClient } from "data-resources/src/prisma-connection";

const client = new PrismaClient();
const redisConnection = makeRedisConnection();

const accountsYoga = createYoga({
  schema: buildSubgraphSchema({
    typeDefs: accountsSchema,
    resolvers: resolvers as GraphQLResolverMap<any>,
  }),
  plugins: accountsPlugins,
  context: contextFactory(redisConnection, client),
});

const app = express();

app.use(accountsYoga.graphqlEndpoint, accountsYoga as any);

export { app };
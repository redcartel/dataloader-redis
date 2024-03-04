import { createYoga } from "graphql-yoga";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { accountsSchema } from "./schema.graphql";
import { resolvers } from "./resolvers";
import { accountsPlugins } from "./middleware";
import { contextFactory } from "./context";
import { makeRedisConnection } from "data-resources/src/redis-connection";
import { GraphQLResolverMap } from "@apollo/subgraph/dist/schema-helper";
import { PrismaClient } from "data-resources/src/prisma-connection";

const client = new PrismaClient();
const redisConnection = makeRedisConnection();

export const accountsYoga = createYoga({
  schema: buildSubgraphSchema({
    typeDefs: accountsSchema,
    resolvers: resolvers as GraphQLResolverMap<any>,
  }),
  plugins: accountsPlugins,
  context: contextFactory(redisConnection, client),
});
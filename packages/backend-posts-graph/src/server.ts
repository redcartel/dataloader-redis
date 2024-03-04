import { createYoga } from "graphql-yoga";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { postsSchema } from "./schema.graphql";
import { resolvers } from "./resolvers";
import { makeRedisConnection } from "data-resources/src/redis-connection";
import { contextFactory } from "./context";
import { GraphQLResolverMap } from "@apollo/subgraph/dist/schema-helper";
import { PrismaClient } from "data-resources/src/prisma-connection";

const client = new PrismaClient();
const redisConnection = makeRedisConnection();

export const postsGraph = createYoga({
  schema: buildSubgraphSchema({
    typeDefs: postsSchema,
    resolvers: resolvers as GraphQLResolverMap<any>,
  }),
  plugins: [],
  context: contextFactory(redisConnection, client),
});

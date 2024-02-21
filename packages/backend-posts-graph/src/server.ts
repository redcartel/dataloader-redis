import { createServer } from "http";
import { createYoga } from "graphql-yoga";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { postsSchema } from "./schema.graphql";
import { resolvers } from "./resolvers";
import { makePostgresConnection } from "data-resources/src/postgres-connection";
import { makeRedisConnection } from "data-resources/src/redis-connection";
import PostsLoaders from "./data-aggregation";
import { PostsContext, contextFactory } from "./context";
import { GraphQLResolverMap } from "@apollo/subgraph/dist/schema-helper";

const pgConnection = makePostgresConnection();
const redisConnection = makeRedisConnection();

export const postsGraph = createYoga({
    schema: buildSubgraphSchema({
      typeDefs: postsSchema,
      resolvers: resolvers as GraphQLResolverMap<any>,
    }),
    plugins: [],
    context: contextFactory(redisConnection, pgConnection),
  });
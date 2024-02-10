import { createServer } from 'http';
import { createYoga } from 'graphql-yoga';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { accountsSchema } from './schema.graphql';
import { resolvers } from './resolvers';
import { accountsPlugins } from './middleware';
import { contextFactory } from './context';
import { makePostgresConnection } from 'data-resources/src/postgres-connection';
import { makeRedisConnection } from 'data-resources/src/redis-connection';
import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper';

const pgConnection = makePostgresConnection();
const redisConnection = makeRedisConnection();

export const usersServer = createServer(
  createYoga({
    schema: buildSubgraphSchema({
      typeDefs: accountsSchema,
      resolvers: resolvers as GraphQLResolverMap<any>
    }),
    plugins: accountsPlugins,
    context: contextFactory(redisConnection, pgConnection)
  }),
);

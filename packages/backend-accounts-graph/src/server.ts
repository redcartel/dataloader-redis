import { createServer } from 'http';
import { createYoga } from 'graphql-yoga';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { accountsSchema } from './schema.graphql';
import { resolvers } from './resolvers';

export const usersServer = createServer(
  createYoga({
    schema: buildSubgraphSchema({
      typeDefs: accountsSchema,
      resolvers: resolvers
    }),
    plugins: [],
    context: () => ({})
  }),
);

import { buildSchema, parse } from 'graphql';
import { createSchema, createYoga, isAsyncIterable } from 'graphql-yoga';
import waitOn from 'wait-on';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { stitchSchemas } from '@graphql-tools/stitch';
import { federationToStitchingSDL, stitchingDirectives } from '@graphql-tools/stitching-directives';
import { Executor } from '@graphql-tools/utils';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { gatewayPlugins } from './middleware';
import { schema } from './schema/gateway.graphql';
import { resolvers } from './resolvers';
import { contextFactory } from './context';


const SDL_QUERY = parse(/* GraphQL */ `
  query GetSDL {
    _service {
      sdl
    }
  }
`);

async function fetchFederationSubschema(executor: Executor) {
  const result = await executor({ document: SDL_QUERY });
  if (isAsyncIterable(result)) {
    throw new Error('Executor returned an AsyncIterable, which is not supported');
  }

  const sdl = federationToStitchingSDL(result.data._service.sdl);
  return {
    schema: buildSchema(sdl, {
      assumeValidSDL: true,
      assumeValid: true,
    }),
    executor,
  };
}

function authExecutor(endpoint: string) {
  return buildHTTPExecutor({
    endpoint: endpoint,
    headers: (execution) => {
      return { account: `${JSON.stringify(execution?.context?.account ?? {})}`}
    }
  })
}

function fetchSchema(endpoint : string) {
  return fetchFederationSubschema(authExecutor(endpoint))
}

function fetchSchemas() {
  return Promise.all([
    fetchSchema(`http://localhost:4001/graphql`),
    fetchSchema(`http://localhost:4002/graphql`),
    createSchema({
      typeDefs: schema,
      resolvers: resolvers
    })
  ]);
}

async function makeGatewaySchema() {
  console.log('gateway wait for subgraphs');
  await waitOn({ resources: ['tcp:localhost:4001', 'tcp:localhost:4002'] });
  console.log('subgraphs seen');
  const { stitchingDirectivesTransformer } = stitchingDirectives();
  const schema = stitchSchemas({
    subschemaConfigTransforms: [stitchingDirectivesTransformer],
    subschemas: await fetchSchemas().then((result) => {
      console.log('schema loaded:', result.length)
      return result
    }),
  });
  return schema;
}

const app = express();

const gatewayApp = createYoga({
  schema: makeGatewaySchema(),
  maskedErrors: process.env['NODE_ENV'] === 'production',
  plugins: gatewayPlugins,
  context: contextFactory(null as any),
  
})

app.use(helmet());
app.use(cors({origin: process.env['CORS_ORIGIN'] ?? '*'}));
app.use(cookieParser());
app.use(gatewayApp.graphqlEndpoint, gatewayApp);

export { app };
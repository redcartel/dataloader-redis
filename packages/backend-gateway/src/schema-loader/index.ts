import { buildSchema, parse } from 'graphql';
import { createLRUCache, createSchema, createYoga, isAsyncIterable } from 'graphql-yoga';
import waitOn from 'wait-on';
import { schema } from '../schema/gateway.graphql';
import { resolvers } from '../resolvers';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { stitchSchemas } from '@graphql-tools/stitch';
import { federationToStitchingSDL, stitchingDirectives } from '@graphql-tools/stitching-directives';
import { Executor } from '@graphql-tools/utils';

const SDL_QUERY = parse(/* GraphQL */ `
  query GetSDL {
    _service {
      sdl
    }
  }
`);

const subschemaCache = createLRUCache<string>();

async function fetchFederationSubschema(executor: Executor, url: string) {
  const result = await executor({ document: SDL_QUERY });
  if (isAsyncIterable(result)) {
    throw new Error('Executor returned an AsyncIterable, which is not supported');
  }
  if (result.data?._service?.sdl) {
    const sdl = federationToStitchingSDL(result.data?._service?.sdl);
    subschemaCache.set(url, sdl);
    if (sdl) {
      return {
        schema: buildSchema(sdl, {
          assumeValidSDL: true,
          assumeValid: true,
        }),
        executor,
      };
    }
  }

  return {
    schema: buildSchema(subschemaCache.get(url) ?? '', {
      assumeValidSDL: true,
      assumeValid: true
    }),
    executor
  }
}

function authExecutor(endpoint: string) {
  return buildHTTPExecutor({
    endpoint: endpoint,
    headers: (execution) => {
      return { account: `${JSON.stringify(execution?.context?.account ?? {})}` }
    }
  })
}

function fetchSchema(endpoint: string) {
  return fetchFederationSubschema(authExecutor(endpoint), endpoint)
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

const endpoints = (process.env['SUBGRAPHS'] as string)
    .split(',')
    .map(hostAndPort => hostAndPort.match('localhost') ? 
        `http://${hostAndPort}/grapqhl` : 
        `https://${hostAndPort}/graphql`);

const schemaCache = createLRUCache({ max: 1, ttl: 60 * 1000 });

let _schemas: ReturnType<typeof makeGatewaySchema>;

(async () => {
    await waitOn({
        resources: (process.env['SUBGRAPHS'] as string).split(',').map(hostAndPort => `tcp:${hostAndPort}`)
    })
    _schemas = makeGatewaySchema();
})();


export function startSchemaReload() {
  setInterval(() => {
    _schemas = makeGatewaySchema();
  }, 5000);
}

export function schemaFactory() {
    return _schemas
}
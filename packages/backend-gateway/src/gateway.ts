import { buildSchema, parse } from 'graphql';
import { createYoga, isAsyncIterable } from 'graphql-yoga';
import waitOn from 'wait-on';
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

async function fetchFederationSubschema(executor: Executor) {
  const result = await executor({ document: SDL_QUERY });
  if (isAsyncIterable(result)) {
    throw new Error('Executor returned an AsyncIterable, which is not supported');
  }

  console.log(result);

  const sdl = federationToStitchingSDL(result.data._service.sdl);
  return {
    schema: buildSchema(sdl, {
      assumeValidSDL: true,
      assumeValid: true,
    }),
    executor,
  };
}

function fetchSchema(endpoint : string) {
  return fetchFederationSubschema(buildHTTPExecutor({endpoint}))
}

function fetchSchemas() {
  return Promise.all([
    fetchSchema(`http://localhost:4001/graphql`)
  ]);
}

async function makeGatewaySchema() {
  console.log('gateway wait for subgraphs');
  await waitOn({ resources: ['tcp:localhost:4001'] });
  console.log('subgraphs seen');
  const { stitchingDirectivesTransformer } = stitchingDirectives();
  const schema = stitchSchemas({
    subschemaConfigTransforms: [stitchingDirectivesTransformer],
    subschemas: await fetchSchemas().then((result) => {
      console.log('schema loaded:', result)
      return result
    }),
  });
  return schema;
}

export const gatewayApp = createYoga({
  schema: makeGatewaySchema(),
  maskedErrors: false,
  plugins: []
})
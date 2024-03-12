import { GraphQLSchema, buildSchema, parse } from "graphql";
import { createLRUCache, isAsyncIterable } from "graphql-yoga";
import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { stitchSchemas } from "@graphql-tools/stitch";
import {
  federationToStitchingSDL,
  stitchingDirectives,
} from "@graphql-tools/stitching-directives";
import stringify from "json-stable-stringify";
import { Executor } from "@graphql-tools/utils";
import waitOn from "wait-on";
import { config } from "common-values";
import { authExecutor } from "graph-common/src/http-executor/authExecutor";

const SDL_QUERY = parse(/* GraphQL */ `
  query GetSDL {
    _service {
      sdl
    }
  }
`);

const subschemaCache = createLRUCache<string>();

/**
 * Fetch a subschema from a subgraph endpoint. If the fetch fails, use a cached result if any exists.
 */
async function fetchFederationSubschema(executor: Executor, url: string) {
  const result = await executor({ document: SDL_QUERY });
  if (isAsyncIterable(result)) {
    throw new Error(
      "Executor returned an AsyncIterable, which is not supported",
    );
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
    schema: buildSchema(subschemaCache.get(url) ?? "", {
      assumeValidSDL: true,
      assumeValid: true,
    }),
    executor,
  };
}

/**
 * Fetch a subschema
 */
function fetchSchema(endpoint: string) {
  return fetchFederationSubschema(authExecutor(endpoint), endpoint);
}

/**
 * Fetch all subschemas from all subgraph endpoints
 */
function fetchSchemas() {
  return Promise.all([
    ...config.gateway.endpoints.map((endpoint) => fetchSchema(endpoint)),
  ]);
}

/**
 * Fetch subschemas and stitch to make gateway schema
 */
async function makeGatewaySchema() {
  const { stitchingDirectivesTransformer } = stitchingDirectives();
  const schema = stitchSchemas({
    subschemaConfigTransforms: [stitchingDirectivesTransformer],
    subschemas: await fetchSchemas(),
  });
  return schema;
}

let _schemas: ReturnType<typeof makeGatewaySchema> | GraphQLSchema;

/**
 * Poll for schema updates every 5 seconds
 */
function startSchemaReload() {
  setInterval(async () => {
    const _reload_schemas = await makeGatewaySchema();
    if (_reload_schemas && stringify(_reload_schemas) !== stringify(_schemas)) {
      console.log("schema update");
      _schemas = _reload_schemas;
    }
  }, 5000);
}

/**
 * Wait for subgraphs, load stitched schema, begin polling for updates
 */
export async function initializeSchema() {
  await waitOn({
    resources: config.gateway.waitOnResources,
  });
  try {
    _schemas = await makeGatewaySchema();
    console.log("initial schema load, ", stringify(_schemas).length);
  } catch (e) {
    console.error("initial schema load failed");
  }
  startSchemaReload();
}

/**
 * Retrieve current schema
 */
export function currentSchema() {
  return _schemas;
}

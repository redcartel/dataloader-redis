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

function authExecutor(endpoint: string) {
  const executor = buildHTTPExecutor({
    endpoint: endpoint,
    headers: (execution) => {
      return {
        'x-account': `${stringify(execution?.context?.account ?? {})}`,
      };
    },
  });
  return executor;
}

function fetchSchema(endpoint: string) {
  return fetchFederationSubschema(authExecutor(endpoint), endpoint);
}

function fetchSchemas() {
  return Promise.all([...config.gateway.endpoints.map((endpoint) => fetchSchema(endpoint))]);
}

async function makeGatewaySchema() {
  const { stitchingDirectivesTransformer } = stitchingDirectives();
  const schema = stitchSchemas({
    subschemaConfigTransforms: [stitchingDirectivesTransformer],
    subschemas: await fetchSchemas().then((result) => {
      return result;
    }),
  });
  return schema;
}

let _schemas: ReturnType<typeof makeGatewaySchema> | GraphQLSchema;

function startSchemaReload(immediateReload: boolean = false) {
  if (immediateReload) {
    console.log("initial retry in 10");
    setTimeout(async () => {
      _schemas = await makeGatewaySchema();
      console.log("schema initial reload,", JSON.stringify(_schemas).length);
    }, 10000);
  }
  setInterval(async () => {
    const _reload_schemas = await makeGatewaySchema();
    if (_reload_schemas && stringify(_reload_schemas) !== stringify(_schemas)) {
      console.log("schema update");
      _schemas = _reload_schemas;
    }
  }, 5000);
}

export async function initializeSchama(refreshPolling = true) {
  await waitOn({
    resources: config.gateway.waitOnResources,
  });
  try {
    _schemas = await makeGatewaySchema();
    console.log("initial schema load, ", stringify(_schemas).length);
    if (refreshPolling) {
      startSchemaReload(false);
    }
  } catch (e) {
    console.error("schema load error,", e);
    if (refreshPolling) {
      startSchemaReload(true);
    } else {
      setTimeout(async () => {
        _schemas = await makeGatewaySchema();
        console.log("schema initial reload,", stringify(_schemas).length);
      }, 15000);
    }
  }
}

export function schemaFactory() {
  return _schemas;
}

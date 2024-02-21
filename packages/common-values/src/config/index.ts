const endpoints = (process.env["SUBGRAPHS"] ?? "")
  .split(",")
  .map((hostAndPort) =>
    hostAndPort.match(/^localhost|^backend/)
      ? `http://${hostAndPort}/graphql`
      : `https://${hostAndPort}/graphql`,
  );

const waitOnResources = (process.env["SUBGRAPHS"] ?? "")
  .split(",")
  .map((hostAndPort) => `tcp:${hostAndPort}`);

export const config = {
  nodeEnv: process.env["NODE_ENV"],
  isDev: process.env["NODE_ENV"] === "development",
  isProd: process.env["NODE_ENV"] === "production",
  gateway: {
    subgraphsString: process.env["SUBGRAPHS"],
    endpoints: endpoints,
    waitOnResources: waitOnResources,
    url: process.env["GATEWAY_URL"],
    corsOrigin: process.env["CORS_ORIGIN"],
  },
  auth: {
    devSpoof: !!(process.env['ALLOW_DEV_SPOOF'] ?? '0').match(/1|true/i)
  },
  backend: {
    dataloaderTtl: parseInt(process.env["DATALOADER_TTL"] ?? `${24 * 60 * 60}`)
  },
  postgres: {
    host: process.env["POSTGRES_HOST"],
    port: parseInt(process.env["POSTGRES_PORT"] ?? "NaN"),
    user: process.env["POSTGRES_USER"],
    password: process.env["POSTGRES_PASSWORD"],
    db: process.env["POSTGRES_DB"],
  },
  redis: {
    url: process.env["REDIS_URL"],
  },
  supertokens: {
    url: process.env["SUPERTOKENS_URL"],
    googleClientId: process.env["GOOGLE_CLIENT_ID"],
    googleClientSecret: process.env["GOOGLE_CLIENT_SECRET"],
    githubClientId: process.env["GITHUB_CLIENT_ID"],
    githubClientSecret: process.env["GITHUB_CLIENT_SECRET"],
  },
  frontend: {
    url: process.env["FRONTEND_URL"],
  },
};

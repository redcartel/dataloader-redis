
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { gatewayPlugins } from './middleware';
import { contextFactory } from './context';
import { makePostgresConnection } from 'data-resources/src/postgres-connection';
import { createYoga } from 'graphql-yoga';
import { schemaFactory } from './schema-loader';

const app = express();

const postgres = makePostgresConnection();

const gatewayApp = createYoga({
  schema: schemaFactory,
  maskedErrors: process.env['NODE_ENV'] === 'production',
  plugins: gatewayPlugins,
  context: contextFactory(postgres),
})

if (process.env['NODE_ENV'] === 'production' || process.env['NODE_ENV'] === 'staging') {
  app.use(helmet());
  app.use(cors({ origin: process.env['CORS_ORIGIN'] ?? undefined }));
}
app.use(cookieParser());
app.use(gatewayApp.graphqlEndpoint, gatewayApp);

export { app };
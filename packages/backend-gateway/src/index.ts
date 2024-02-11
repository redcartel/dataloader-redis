import { gatewayApp } from "./server";
import { initializeSchama } from "./schema-loader";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import "./supertokens";
import express from "express";
import { applyExpressMiddleware } from "./middleware/express-plugins";

initializeSchama(true);

const app = express();

applyExpressMiddleware(app);

app.use(
  gatewayApp.graphqlEndpoint,
  verifySession({
    sessionRequired: false,
  }),
  gatewayApp,
);

app.listen(4000, () => console.log("gateway running on port 4000"));

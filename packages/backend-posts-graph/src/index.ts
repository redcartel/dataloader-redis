import { postsGraph } from "./server";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "common-values";

const app = express();

app.use(
  cors({
    origin: config.gateway.corsOrigin as string ?? 'http://localhost:3000',
    allowedHeaders: ["content-type"],
    credentials: true,
  }),
);
app.use(helmet());

app.use(postsGraph.graphqlEndpoint, postsGraph);

app.listen(4002, () => {
  console.log(`Posts service running at port 4002`);
});

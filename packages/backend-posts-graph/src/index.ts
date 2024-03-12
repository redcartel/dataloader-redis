import { postsGraph } from "./server";
import express from "express";
import { config } from "common-values";

const app = express();

app.use(postsGraph.graphqlEndpoint, postsGraph);

const port = 4000;

app.listen(port, () => {
  console.log(`Posts service running at port ${port}`);
});

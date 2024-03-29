import express from "express";
import { accountsYoga } from "./server";
import { config } from "common-values";

const app = express();
app.use(accountsYoga.graphqlEndpoint, accountsYoga as any);

const port = 4000;

app.listen(port, () => {
  console.log(`Accounts service running at port ${port}`);
});

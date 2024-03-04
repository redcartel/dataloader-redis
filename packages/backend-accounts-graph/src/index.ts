import express from 'express';
import { accountsYoga } from './server';

const app = express();
app.use(accountsYoga.graphqlEndpoint, accountsYoga as any);

app.listen(4001, () => {
  console.log(`Accounts service running at port 4001`);
});
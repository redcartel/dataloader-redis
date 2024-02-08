import { getAccountDataLoader } from "../data-aggregation";

console.log(1);
const accountLoader = getAccountDataLoader();
console.log(2);

export const resolvers = {
    Account: {
      __resolveReference: async ({ id }, context) => {
        return await accountLoader.load(id);
      }
    },
    Query: {
      account: async (_root, { id }, context) => await accountLoader.load(id)
    },
  }
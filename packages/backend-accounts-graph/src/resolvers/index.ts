import { AccountsContext } from "../context";

export const resolvers = {
    Account: {
      __resolveReference: async ({ id }, { loaders } : AccountsContext) => {
        return await loaders.accountById.load(id);
      }
    },
    Query: {
      account: async (_root, { id }, { loaders } : AccountsContext) => await loaders.accountById.load(id)
    },
  }
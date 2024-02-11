import { AccountsContext } from "../context";

export const resolvers = {
  Account: {
    __resolveReference: async ({ id }, { loaders }: AccountsContext) => {
      return await loaders.accountById.load(id);
    },
  },
  Query: {
    account: async (_root, { id }, context: AccountsContext) => {
      return await context.loaders.accountById?.load(id);
    },
    me: async (_root, _args, context: AccountsContext) => {
      return context.account;
    },
  },
};

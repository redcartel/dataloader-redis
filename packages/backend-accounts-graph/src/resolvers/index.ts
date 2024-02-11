import { Request, Response } from "express";
import { AccountsContext } from "../context";
import { login } from "../services/authentication";
import { YogaInitialContext } from "graphql-yoga";

export const resolvers = {
  Account: {
    __resolveReference: async ({ id }, { loaders }: AccountsContext) => {
      return await loaders.accountById.load(id);
    }
  },
  Query: {
    account: async (_root, { id }, context: AccountsContext) => {
      return await context.loaders.accountById?.load(id)
    }
  }
}
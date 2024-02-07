export const resolvers = {
    Account: {
      __resolveReference: async ({ id }, context) => ({id: 1, email: 'test@example.com', username: 'example'})
    },
    Query: {
      account: async (_root, { id }, context) =>
      ({id: 1, email: 'test@example.com', username: 'example'})
    },
  }
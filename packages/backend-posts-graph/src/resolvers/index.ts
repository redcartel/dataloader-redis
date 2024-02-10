import { GraphQLResolverMap } from "@apollo/subgraph/dist/schema-helper";
import { PostsContext } from "../context";
import { PostType } from "../data-access";

type IdArgs = {
  id : string
}

type AccountReference = {
  id : string
}

export const resolvers : GraphQLResolverMap<PostsContext> = {
    Post: {
      __resolveReference: async ({ id } : IdArgs, { loaders } : PostsContext) => {
        return await loaders.postsById.load(id);
      },
      author: async (root: PostType, { }, { accountLoaders } : PostsContext) => {
        return await accountLoaders.accountById.load(root.accounts_id!);
      }
    },
    Account: {
      posts: async (root : AccountReference, { }, { loaders } : PostsContext) => {
        return await loaders.postListByAccountsId.load(root.id)
      }
    },
    Query: {
      post: async (_root, { id } : IdArgs, { loaders } : PostsContext) => {
        return await loaders.postsById.load(id);
      }
    },
  }
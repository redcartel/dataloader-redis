import { GraphQLResolverMap } from "@apollo/subgraph/dist/schema-helper";
import { PostsContext } from "../context";
import { LikeType, PostType } from "../data-access";

type IdArgs = {
  id: string;
};

type AccountReference = {
  id: string;
};

export const resolvers: GraphQLResolverMap<PostsContext> = {
  Post: {
    __resolveReference: async ({ id }: IdArgs, { loaders }: PostsContext) => {
      const post = await loaders.postsById.load(id);
      console.log("reference resolves ", post);
      return post;
    },
    author: async (root: PostType, {}, { accountLoaders }: PostsContext) => {
      return await accountLoaders.accountById.load(root.accounts_id!);
    },
    likes: async (root: PostType, {}, { loaders }: PostsContext) => {
      return await loaders.likeListByPostsId.load(root.id!);
    },
    likes_count: async (root: PostType, {}, { loaders }: PostsContext) => {
      return (await loaders.likeCountByPostsId.load(root.id!)) ?? 0;
    },
  },
  Like: {
    account: async (root: LikeType, {}, { accountLoaders }: PostsContext) => {
      return await accountLoaders.accountById.load(root.accounts_id!);
    },
    post: async (root: LikeType, {}, { loaders }: PostsContext) => {
      return await loaders.postsById.load(root.posts_id!);
    },
  },
  Account: {
    posts: async (root: AccountReference, {}, { loaders }: PostsContext) => {
      return await loaders.postListByAccountsId.load(root.id);
    },
    likes: async (root: AccountReference, {}, { loaders }: PostsContext) => {
      return await loaders.likeListByAccountsId.load(root.id);
    },
  },
  Query: {
    post: async (_root, { id }: IdArgs, { loaders }: PostsContext) => {
      return await loaders.postsById.load(id);
    },
  },
};

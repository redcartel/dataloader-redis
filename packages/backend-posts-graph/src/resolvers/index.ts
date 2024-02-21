import { GraphQLResolverMap } from "@apollo/subgraph/dist/schema-helper";
import { PostsContext } from "../context";
import { LikeType, PostType } from "../data-access";
import { GraphQLError } from "graphql";
import { Graph } from "redis";

type IdArgs = {
  id: string;
};

type AccountReference = {
  id: string;
};

type MakePostArgs = {
  body: string;
};

type PostsInputArgs = {
  postsInput: {
    accountsId?: string;
    cursor?: string;
  };
};

function getRoundedDate(cursor?: string) {
  const currentMs = new Date().getTime();
  let cursorMs = currentMs;
  const ms = cursor ? Date.parse(cursor) : currentMs;
  if (ms - 60000 > currentMs) {
    throw new GraphQLError("Bad cursor");
  }
  const roundedMs = Math.ceil(ms / 500) * 500;
  const result = new Date(0);
  result.setMilliseconds(roundedMs);
  return result;
}

export const resolvers: GraphQLResolverMap<PostsContext> = {
  Post: {
    __resolveReference: async ({ id }: IdArgs, { loaders }: PostsContext) => {
      const post = await loaders.postsById.load(id);
      return post;
    },
    author: async (root: PostType, {}, { accountLoaders }: PostsContext) => {
      return await accountLoaders.accountById.load(root.accounts_id!);
    },
    likes: async (root: PostType, {}, { loaders, account }: PostsContext) => {
      if (account.id === root.accounts_id) {
        return await loaders.likesByPostAndCursor.load([
          root.id!,
          getRoundedDate(),
        ]);
      } else return null;
    },
    likes_count: async (root: PostType, {}, { loaders }: PostsContext) => {
      return (await loaders.likeCountByPostsId.load(root.id!)) ?? 0;
    },
  },
  Like: {
    post: async (root: LikeType, {}, { loaders, account }: PostsContext) => {
      const post = await loaders.postsById.load(root.posts_id!);
      if (account.id !== post.accounts_id) {
        throw new GraphQLError("Not Found");
      }
      return post;
    },
    account: async (
      root: LikeType,
      { loaders, accountLoaders, account }: PostsContext,
    ) => {
      const post = await loaders.postsById.load(root.posts_id!);
      if (account.id !== post.accounts_id) {
        return null;
      }
      const returnAccount = await accountLoaders.accountById.load(
        root.accounts_id!,
      );
      return returnAccount;
    },
  },
  Account: {
    posts: async (root: AccountReference, {}, { loaders }: PostsContext) => {
      return await loaders.postsByAccountAndCursor.load([
        root.id,
        getRoundedDate(),
      ]);
    },
  },
  Query: {
    post: async (_root, { id }: IdArgs, { loaders }: PostsContext) => {
      return await loaders.postsById.load(id);
    },
    posts: async (
      _root,
      { postsInput }: PostsInputArgs,
      { loaders }: PostsContext,
    ) => {
      const date = getRoundedDate(postsInput?.cursor);
      if (postsInput?.accountsId) {
        return await loaders.postsByAccountAndCursor.load([
          postsInput.accountsId,
          date,
        ]);
      } else {
        return await loaders.postsByCursor.load(date);
      }
    },
  },
  Mutation: {
    makePost: async (
      _root,
      { body }: MakePostArgs,
      { postRepository, loaders, account }: PostsContext,
    ) => {
      const { id: accountsId } = account;
      if (!accountsId) {
        throw new GraphQLError("Unauthorized");
      }
      if (!body || !body.length) {
        throw new GraphQLError("Argument error");
      }
      const post = await postRepository.insertPost(
        accountsId,
        body.slice(0, 140),
      );
      if (post instanceof Error) {
        throw new GraphQLError("Error creating post");
      }
      await loaders.postsById.prime(post.id!, post);
      return post;
    },
    likePost: async (
      _root,
      { id: postsId },
      { postRepository, loaders, account }: PostsContext,
    ) => {
      const { id: accountsId } = account;
      if (!accountsId) {
        throw new GraphQLError("Unauthorized");
      }
      if (!postsId) {
        throw new GraphQLError("Not found");
      }
      const post = await loaders.postsById.load(postsId);
      if (post instanceof Error) {
        throw new GraphQLError("Not found");
      }
      const like = await postRepository.likePost(accountsId, postsId);
      await loaders.likeCountByPostsId.clear(postsId);
      return like;
    },
    unlikePost: async (
      _root,
      { id: postsId },
      { postRepository, loaders, account }: PostsContext,
    ) => {
      const { id: accountsId } = account;
      if (!accountsId) {
        throw new GraphQLError("Unauthorized");
      }
      if (!postsId) {
        throw new GraphQLError("Not Found");
      }
      const post = await loaders.postsById.load(postsId);
      if (post instanceof Error) {
        throw new GraphQLError("Not Found");
      }
      await postRepository.unlikePost(accountsId, postsId);
      await loaders.postsById.clear(postsId);
      return post;
    },
  },
};

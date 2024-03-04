import { GraphQLResolverMap } from "@apollo/subgraph/dist/schema-helper";
import { PostsContext } from "../context";
// import { LikeType, PostType } from "../data-access";
import { GraphQLError } from "graphql";
import { Graph } from "redis";
import { config } from "common-values";

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
    authorId?: string;
    cursor?: string;
    cursorId?: string;
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
      try {
        const post = await loaders.postsById.load(id);
        return post;
      }
      catch {
        return null;
      }
    },
    author: async (root: any, {}, { accountLoaders }: PostsContext) => {
      return await accountLoaders.accountById.load(root.accountsId!);
    },
    likes: async (root: any, {}, { loaders, account }: PostsContext) => {
      if (account.id === root.accountsId) {
        return await loaders.likesByPostAndCursor.load([
          root.id!,
          getRoundedDate(),
          '00000000-0000-0000-0000-000000000000'
        ]);
      } else return null;
    },
    likes_count: async (root: any, {}, { loaders }: PostsContext) => {
      return (await loaders.likeCountByPostsId.load(root.id!)) ?? 0;
    },
  },
  Like: {
    post: async (root: any, {}, { loaders, account }: PostsContext) => {
      const post = await loaders.postsById.load(root.posts_id!);
      if (account.id !== post.accountsId) {
        throw new GraphQLError("Item Not Found");
      }
      return post;
    },
    account: async (
      root: any,
      { loaders, accountLoaders, account }: PostsContext,
    ) => {
      const post = await loaders.postsById.load(root.posts_id!);
      if (account.id !== post.accountsId) {
        return null;
      }
      const returnAccount = await accountLoaders.accountById.load(
        root.accountsId!,
      );
      return returnAccount;
    },
  },
  Account: {
    posts: async (root: AccountReference, {}, { loaders }: PostsContext) => {
      try {
      return await loaders.postsByAccountAndCursor.load([
        root.id,
        getRoundedDate(),
        'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF'
      ]);
      }
      catch {
        console.error('posts error')
        return [];
      }
    },
  },
  Query: {
    post: async (_root, { id }: IdArgs, { loaders }: PostsContext) => {
      try {
        const p = await loaders.postsById.load(id);
        return p;
      }
      catch {
        return null;
      }
    },
    posts: async (
      _root,
      { postsInput }: PostsInputArgs,
      { loaders }: PostsContext,
    ) => {
      const date = getRoundedDate(postsInput?.cursor);
      const cursorId = postsInput?.cursorId ?? 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF';
      let posts : any[];
      let nextCursorId : string | undefined = undefined;
      let nextCursorTimestamp : Date | undefined = undefined;
      if (postsInput?.authorId) {
        posts = await loaders.postsByAccountAndCursor.load([
          postsInput.authorId,
          date,
          cursorId
        ]);
      } else {
        posts = await loaders.postsByCursor.load([date, cursorId]);
      }
      if (posts.length > config.backend.pageLimit) {
        nextCursorTimestamp = posts[config.backend.pageLimit].createdAt;
        nextCursorId = posts[config.backend.pageLimit].id;
      }
      return {
        posts,
        cursorId: nextCursorId,
        cursorTimestamp: nextCursorTimestamp
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
      // await loaders.postsById.prime(post.id!, post);
      return post;
    },
  //   likePost: async (
  //     _root,
  //     { id: postsId },
  //     { postRepository, loaders, account }: PostsContext,
  //   ) => {
  //     const { id: accountsId } = account;
  //     if (!accountsId) {
  //       throw new GraphQLError("Unauthorized");
  //     }
  //     if (!postsId) {
  //       throw new GraphQLError("Item Not Found");
  //     }
  //     const post = await loaders.postsById.load(postsId);
  //     if (post instanceof Error) {
  //       throw new GraphQLError("Item Not Found");
  //     }
  //     const like = await postRepository.likePost(accountsId, postsId);
  //     await loaders.likeCountByPostsId.clear(postsId);
  //     return like;
  //   },
  //   unlikePost: async (
  //     _root,
  //     { id: postsId },
  //     { postRepository, loaders, account }: PostsContext,
  //   ) => {
  //     const { id: accountsId } = account;
  //     if (!accountsId) {
  //       throw new GraphQLError("Unauthorized");
  //     }
  //     if (!postsId) {
  //       throw new GraphQLError("Item Not Found");
  //     }
  //     const post = await loaders.postsById.load(postsId);
  //     if (post instanceof Error) {
  //       throw new GraphQLError("Item Not Found");
  //     }
  //     await postRepository.unlikePost(accountsId, postsId);
  //     await loaders.postsById.clear(postsId);
  //     return post;
  //   },
  // },
  }
};

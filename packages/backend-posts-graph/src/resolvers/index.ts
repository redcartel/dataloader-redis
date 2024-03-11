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
  input: {
    authorId?: string;
    cursorTimestamp?: string;
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
  // const roundedMs = Math.ceil(ms / 500) * 500;
  const result = new Date(0);
  result.setMilliseconds(ms);
  console.log(result);
  return result;
}

export const resolvers: GraphQLResolverMap<PostsContext> = {
  Post: {
    __resolveReference: async ({ id }: IdArgs, { loaders }: PostsContext) => {
      try {
        const post = await loaders.postsById.load(id);
        return post;
      } catch {
        return null;
      }
    },
    author: async (root: any, {}, { accountLoaders }: PostsContext) => {
      return await accountLoaders.accountById.load(root?.authorId!);
    },
  },
  Like: {
    post: async (root: any, {}, { loaders, account }: PostsContext) => {
      const post = await loaders.postsById.load(root.posts_id!);
      if (account.id !== post?.authorId) {
        throw new GraphQLError("Item Not Found");
      }
      return post;
    },
    account: async (
      root: any,
      { loaders, accountLoaders, account }: PostsContext,
    ) => {
      const post = await loaders.postsById.load(root.posts_id!);
      if (account.id !== post?.authorId) {
        return null;
      }
      const returnAccount = await accountLoaders.accountById.load(
        root.authorId!,
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
          "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
        ]);
      } catch {
        console.error("posts error");
        return [];
      }
    },
  },
  Query: {
    post: async (_root, { id }: IdArgs, { loaders }: PostsContext) => {
      try {
        const p = await loaders.postsById.load(id);
        return p;
      } catch {
        return null;
      }
    },
    posts: async (
      _root,
      { input }: PostsInputArgs,
      { loaders }: PostsContext,
    ) => {
      console.log("INPUT: ", input);
      const date = getRoundedDate(input?.cursorTimestamp);
      console.log("DATE: ", date);
      const cursorId =
        input?.cursorId ?? "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF";
      let posts: any[];
      let nextCursorId: string | undefined = undefined;
      let nextCursorTimestamp: Date | undefined = undefined;
      if (input?.authorId) {
        posts = await loaders.postsByAccountAndCursor.load([
          input.authorId,
          date,
          cursorId,
        ]);
      } else {
        posts = await loaders.postsByCursor.load([date, cursorId]);
      }
      if (posts.length > config.backend.pageLimit) {
        nextCursorTimestamp = posts[config.backend.pageLimit].createdAt as Date;
        nextCursorId = posts[config.backend.pageLimit].id;
      }
      return {
        posts,
        cursorId: nextCursorId,
        cursorTimestamp: nextCursorTimestamp?.toISOString(),
      };
    },
  },
  Mutation: {
    createPost: async (
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
      const post = await postRepository.insertPost(accountsId, body);
      if (post instanceof Error) {
        throw new GraphQLError("Error creating post");
      }
      return post;
    },
  },
};

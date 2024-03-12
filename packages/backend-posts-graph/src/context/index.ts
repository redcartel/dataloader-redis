import { RedisClientType } from "redis";
import { postLoaderFactory } from "../data-aggregation";
import { accountLoaderFactory } from "backend-accounts-graph/src/data-aggregation";
import { PrismaClient } from "data-resources/src/prisma-connection";
import { postRepositoryFactory } from "../data-access";
import { accountRepositoryFactory } from "backend-accounts-graph/src/data-access";
import { getAccountFromContext } from "graph-common/src/subgraph-context/getAccountFromContext";
import { YogaInitialContext } from "graphql-yoga";

export function contextFactory(
  redisConnection: RedisClientType,
  client: PrismaClient,
) {
  const postRepo = postRepositoryFactory(client);
  const accountRepo = accountRepositoryFactory(client);
  const postLoaders = postLoaderFactory(redisConnection, postRepo);
  const accountLoaders = accountLoaderFactory(redisConnection, accountRepo);
  return (context: YogaInitialContext) => {
    return {
      account: getAccountFromContext(context),
      loaders: postLoaders,
      accountLoaders: accountLoaders,
      postRepository: postRepo,
    };
  };
}

export type PostsContext = ReturnType<ReturnType<typeof contextFactory>>;

import { RedisClientType } from "redis";
import { Pool } from "pg";
import { accountLoaderFactory } from "../data-aggregation";
import { PrismaClient } from "data-resources/src/prisma-connection";
import { config } from "common-values";
import { accountRepositoryFactory } from "../data-access";
import { YogaInitialContext } from "graphql-yoga";
import { getAccountFromContext } from "graph-common/src/subgraph-context/getAccountFromContext";

export function contextFactory(
  redisConnection: RedisClientType,
  client: PrismaClient,
) {
  const loaders = accountLoaderFactory(
    redisConnection,
    accountRepositoryFactory(client, config.backend.pageLimit),
  );
  return (context: YogaInitialContext) => {
    return {
      ...context,
      account: getAccountFromContext(context),
      loaders,
    };
  };
}

export type AccountsContext = ReturnType<ReturnType<typeof contextFactory>>;

import { RedisClientType } from "redis";
import { Pool } from "pg";
import { accountLoaderFactory } from "../data-aggregation";
import { PrismaClient } from "data-resources/src/prisma-connection";
import { config } from "common-values";
import { accountRepositoryFactory } from "../data-access";

export function contextFactory(
  redisConnection: RedisClientType,
  client: PrismaClient,
) {
  const loaders = accountLoaderFactory(redisConnection, accountRepositoryFactory(client));
  return (context: any) => {
    return {
      ...context,
      account: JSON.parse(context.request.headers.get("x-account") ?? "{}"),
      loaders
    };
  };
}

export type AccountsContext = ReturnType<ReturnType<typeof contextFactory>>;

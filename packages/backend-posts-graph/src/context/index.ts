import { RedisClientType } from "redis";
import PostsLoaders from "../data-aggregation";
import { Pool } from "pg";
import AccountsLoaders from "backend-accounts-graph/src/data-aggregation";

export function contextFactory(
  redisConnection: RedisClientType,
  postgresConnection: Pool,
) {
  return (context) => {
    const account = JSON.parse(context.request.headers.get("x-account") ?? "{}");
    return {
      account,
      loaders: new PostsLoaders(redisConnection, postgresConnection),
      accountLoaders: new AccountsLoaders(redisConnection, postgresConnection),
    };
  };
}

export type PostsContext = ReturnType<ReturnType<typeof contextFactory>>;

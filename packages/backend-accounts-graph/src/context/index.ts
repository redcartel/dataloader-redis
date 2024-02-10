import { RedisClientType } from "redis";
import { Pool } from "pg";
import AccountsLoaders from "../data-aggregation";

export function contextFactory(redisConnection : RedisClientType, postgresConnection: Pool) {
    return () => ({loaders: new AccountsLoaders(redisConnection, postgresConnection)});
}

export type AccountsContext = ReturnType<ReturnType<typeof contextFactory>>
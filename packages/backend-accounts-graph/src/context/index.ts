import { RedisClientType } from "redis";
import { Pool } from "pg";
import AccountsLoaders from "../data-aggregation";
import { YogaInitialContext} from "graphql-yoga";
import { Response } from "express";

export function contextFactory(redisConnection : RedisClientType, postgresConnection: Pool) {
    return (context : any) => {
        return { ...context, account: JSON.parse(context.request.headers.get('account') ?? '{}'), loaders: new AccountsLoaders(redisConnection, postgresConnection)}
    };
}

export type AccountsContext = ReturnType<ReturnType<typeof contextFactory>>
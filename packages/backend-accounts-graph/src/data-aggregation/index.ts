import { makeRedisConnection } from "data-resources/src/redis-connection";
import { AccountType, getAccountsRepository } from "../data-access";
import DataLoaderRedis from "dataloader-redis";

const redisConnection = makeRedisConnection();
redisConnection.connect();

export function getAccountDataLoader() {
    const repo = getAccountsRepository();
    return new DataLoaderRedis<string, AccountType>(redisConnection, async (ids: string[]) => repo.accountAggregate(ids), {
        ttl: 15,
        dataLoaderOptions: {
            cache: false
        }
    });
}
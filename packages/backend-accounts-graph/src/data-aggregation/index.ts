import { AccountRepository, AccountType } from "../data-access";
import DataLoaderRedis from "dataloader-redis";
import { Pool } from "pg";
import { RedisClientType } from "redis";

export default class AccountsLoaders {
    private redis : RedisClientType;
    private postgres : Pool;

    private repo : AccountRepository;

    public accountById : DataLoaderRedis<string, AccountType>

    constructor(redisConnection: RedisClientType, postgresConnection: Pool) {
        this.redis = redisConnection;
        this.postgres = postgresConnection;
        this.repo = new AccountRepository(this.postgres);

        this.accountById = new DataLoaderRedis<string, AccountType>(this.redis, (ids: string[]) => this.repo.accountAggregate(ids), {
            ttl: 15,
            dataLoaderOptions: {
                cache: false
            }
        });
    }
}
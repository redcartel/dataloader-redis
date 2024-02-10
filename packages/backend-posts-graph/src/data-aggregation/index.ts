import { makeRedisConnection } from "data-resources/src/redis-connection";
import { RedisClientType } from 'redis';
import  PostRepository, { PostType }from "../data-access";
import DataLoaderRedis from "dataloader-redis";
import { Pool } from "pg";

export default class PostsLoaders {
    private redis : RedisClientType;
    private postgres : Pool;

    private repo : PostRepository;

    public postsById : DataLoaderRedis<string, PostType>;
    public postListByAccountsId : DataLoaderRedis<string, PostType[]>;

    constructor(redisConnection: RedisClientType, postgresConnectioon: Pool) {
        this.redis = redisConnection;
        this.postgres = postgresConnectioon;
        this.repo = new PostRepository(this.postgres);
        
        this.postsById = new DataLoaderRedis<string, PostType>(this.redis, async (ids: string[]) => this.repo.postAggregate(ids), {
            ttl: 15,
            dataLoaderOptions: {
                cache: false
            }
        });

        this.postListByAccountsId = new DataLoaderRedis<string, PostType[]>(this.redis, async (ids: string[]) => this.repo.postsByAccountAggregate(ids), {
            ttl: 15,
            dataLoaderOptions: {
                cache: false
            }
        });
    }
}
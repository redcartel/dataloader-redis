import { makeRedisConnection } from "data-resources/src/redis-connection";
import { RedisClientType } from 'redis';
import  PostRepository, { LikeType, PostType }from "../data-access";
import DataLoaderRedis from "dataloader-redis";
import { Pool } from "pg";

export default class PostsLoaders {
    private redis : RedisClientType;
    private postgres : Pool;

    private repo : PostRepository;

    public postsById : DataLoaderRedis<string, PostType>;
    public postListByAccountsId : DataLoaderRedis<string, PostType[]>;
    public likeListByPostsId : DataLoaderRedis<string, LikeType[]>;
    public likeListByAccountsId : DataLoaderRedis<string, LikeType[]>;
    public likeCountByPostsId : DataLoaderRedis<string, number>;

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

        this.likeListByPostsId = new DataLoaderRedis<string, LikeType[]>(this.redis, async (ids: string[]) => this.repo.likesByPostAggregate(ids)), {
            ttl: 15,
            dataLoaderOptions: {
                cache: false
            }
        }

        this.likeCountByPostsId = new DataLoaderRedis<string, number>(this.redis, async (ids: string[]) => this.repo.likesCountByPostAggregate(ids), {
            ttl: 15,
            dataLoaderOptions: {
                cache: false
            }
        })

        this.likeListByAccountsId = new DataLoaderRedis<string, LikeType[]>(this.redis, async (ids: string[]) => this.repo.likesByAccountAggregate(ids), {
            ttl: 15,
            dataLoaderOptions: {
                cache: false
            }
        })
    }
}
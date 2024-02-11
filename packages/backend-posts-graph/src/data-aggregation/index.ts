import { RedisClientType } from "redis";
import PostRepository, { LikeType, PostType } from "../data-access";
import DataLoaderRedis from "dataloader-redis";
import { Pool } from "pg";
import { config } from "common-values";

export default class PostsLoaders {
  private redis: RedisClientType;
  private postgres: Pool;

  private repo: PostRepository;

  public postsById: DataLoaderRedis<string, PostType>;
  public postListByAccountsId: DataLoaderRedis<string, PostType[]>;
  public likeListByPostsId: DataLoaderRedis<string, LikeType[]>;
  public likeListByAccountsId: DataLoaderRedis<string, LikeType[]>;
  public likeCountByPostsId: DataLoaderRedis<string, number>;

  constructor(redisConnection: RedisClientType, postgresConnectioon: Pool) {
    this.redis = redisConnection;
    this.postgres = postgresConnectioon;
    this.repo = new PostRepository(this.postgres);

    this.postsById = new DataLoaderRedis<string, PostType>(
      this.redis,
      async (ids: string[]) => this.repo.postAggregate(ids),
      {
        ttl: config.backend.dataloaderTtl
      },
    );

    this.postListByAccountsId = new DataLoaderRedis<string, PostType[]>(
      this.redis,
      async (ids: string[]) => this.repo.postsByAccountAggregate(ids),
      {
        ttl: config.backend.dataloaderTtl
      },
    );

    (this.likeListByPostsId = new DataLoaderRedis<string, LikeType[]>(
      this.redis,
      async (ids: string[]) => this.repo.likesByPostAggregate(ids),
    )),
      {
        ttl: config.backend.dataloaderTtl
      };

    this.likeCountByPostsId = new DataLoaderRedis<string, number>(
      this.redis,
      async (ids: string[]) => this.repo.likesCountByPostAggregate(ids),
      {
        ttl: config.backend.dataloaderTtl
      },
    );

    this.likeListByAccountsId = new DataLoaderRedis<string, LikeType[]>(
      this.redis,
      async (ids: string[]) => this.repo.likesByAccountAggregate(ids),
      {
        ttl: config.backend.dataloaderTtl
      },
    );
  }
}

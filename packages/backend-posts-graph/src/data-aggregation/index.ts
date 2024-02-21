import { RedisClientType } from "redis";
import PostRepository, { LikeType, LikesCursorType, PostType, PostsCursorType } from "../data-access";
import DataLoaderRedis from "dataloader-redis";
import { Pool } from "pg";
import { config } from "common-values";

export default class PostsLoaders {
  private redis: RedisClientType;
  private postgres: Pool;

  public limit : number = 20;

  private repo: PostRepository;

  public postsById: DataLoaderRedis<string, PostType>;
  public likeCountByPostsId: DataLoaderRedis<string, number>;
  public likesByPostAndCursor: DataLoaderRedis<[string, Date], LikesCursorType>;
  public postsByCursor: DataLoaderRedis<Date, PostsCursorType>;
  public postsByAccountAndCursor: DataLoaderRedis<[string, Date], PostsCursorType>; 

  constructor(redisConnection: RedisClientType, postgresConnectioon: Pool, limit?: number) {
    this.redis = redisConnection;
    this.postgres = postgresConnectioon;
    this.repo = new PostRepository(this.postgres);
    this.limit = limit ?? this.limit;

    this.postsById = new DataLoaderRedis<string, PostType>(
      this.redis,
      async (ids: string[]) => this.repo.postByIdsAggregate(ids),
      {
        ttl: config.backend.dataloaderTtl
      },
    );

    (this.likesByPostAndCursor = new DataLoaderRedis<[string, Date], LikesCursorType>(
      this.redis,
      async (postCursors) => this.repo.likesByPostsAndCursorsAggregate(postCursors),
    )),
      {
        ttl: 2
      };

    this.likeCountByPostsId = new DataLoaderRedis<string, number>(
      this.redis,
      async (ids: string[]) => this.repo.likesCountByPostAggregate(ids),
      {
        ttl: config.backend.dataloaderTtl
      },
    );

    this.postsByCursor = new DataLoaderRedis<Date, PostsCursorType>(
      this.redis,
      async (cursors: Date[]) => this.repo.postsByCursorAggregate(cursors, this.limit),
      {
        ttl: 2
      }
    )

    this.postsByAccountAndCursor = new DataLoaderRedis<[string, Date], PostsCursorType>(
      this.redis,
      async(accountCursors) => this.repo.postsByAccountsAndCursorsAggregate(accountCursors, this.limit),
      {
        ttl: 2
      }
    )
  }
}

import { config } from "common-values";
import { AccountRepository } from "../data-access";
import DataLoaderRedis from "dataloader-redis";
import { Pool } from "pg";
import { RedisClientType } from "redis";
import { PrismaClient } from "data-resources/src/prisma-connection";
import { Prisma } from "data-resources/src/generated/prismaClient";

export default class AccountsLoaders {
  private redis: RedisClientType;

  private repo: AccountRepository;

  public accountById: DataLoaderRedis<string, Prisma.AccountGetPayload<{}>>;

  constructor(redisConnection: RedisClientType, prisma: PrismaClient) {
    this.redis = redisConnection;
    this.repo = new AccountRepository(prisma);

    this.accountById = new DataLoaderRedis(
      this.redis,
      (ids: string[]) => this.repo.accountAggregate(ids),
      {
        ttl: config.backend.dataloaderTtl
      },
    );
  }
}

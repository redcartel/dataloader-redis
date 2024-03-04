import { config } from "common-values";
import { accountRepositoryFactory } from "../data-access";
import DataLoaderRedis from "dataloader-redis";
import { Pool } from "pg";
import { RedisClientType } from "redis";
import { PrismaClient } from "data-resources/src/prisma-connection";
import { Prisma } from "data-resources/src/generated/prismaClient";

export function accountLoaderFactory(
  redis: RedisClientType,
  repo: ReturnType<typeof accountRepositoryFactory>,
) {
  return {
    accountById: new DataLoaderRedis(
      redis,
      (ids: string[]) => repo.accountAggregate(ids),
      {
        ttl: config.backend.dataloaderTtl,
      },
    ),
  };
}

import { RedisClientType } from "redis";
import { postRepositoryFactory } from "../data-access";
import DataLoaderRedis from "dataloader-redis";
import { Pool } from "pg";
import { config } from "common-values";
import { PrismaClient } from "data-resources/src/prisma-connection";

export interface PostsCursorResponse {
  posts: any[];
  cursorTimestamp?: string;
  cursorId?: string;
}

export function postLoaderFactory(
  redis: RedisClientType,
  repo: ReturnType<typeof postRepositoryFactory>,
) {
  return {
    postsById: new DataLoaderRedis(
      redis,
      async (ids: string[]) => repo.postByIdsAggregate(ids),
      {
        ttl: config.backend.dataloaderTtl,
        missingValue: (key) => undefined,
      },
    ),

    postsByCursor: new DataLoaderRedis(
      redis,
      async (cursors: [Date, string][]) =>
        await repo.postsByCursorAggregate(cursors),
      {
        ttl: 2,
      },
    ),

    postsByAccountAndCursor: new DataLoaderRedis(
      redis,
      async (accountCursors: [string, Date, string][]) =>
        await repo.postsByAccountsAndCursorsAggregate(accountCursors),
      {
        ttl: 2,
      },
    ),
  };
}
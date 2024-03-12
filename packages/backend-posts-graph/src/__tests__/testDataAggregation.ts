import { createClient } from "dataloader-redis/src/nondist/redis-mock";
import { genPrismaMock } from "data-resources/src/testResources/prismaMock";
import { postLoaderFactory } from "../data-aggregation";
import { PrismaClient } from "data-resources/src/prisma-connection";
import { makeRedisConnection } from "data-resources/src/redis-connection";
import { postRepositoryFactory } from "../data-access";
import { RedisClientType } from "redis";
import { config } from "common-values";

let loaders: ReturnType<typeof postLoaderFactory>;
let realLoaders: ReturnType<typeof postLoaderFactory>;

const testLive = config.test.liveTest;

let connection: RedisClientType | undefined = undefined;

beforeEach(async () => {
  loaders = postLoaderFactory(
    createClient() as any,
    postRepositoryFactory(genPrismaMock() as any),
  );
  if (testLive) {
    connection = makeRedisConnection();
    await connection.connect();
    realLoaders = postLoaderFactory(
      connection,
      postRepositoryFactory(new PrismaClient(), 20),
    );
  }
});

afterEach(async () => {
  await connection?.disconnect();
});

test("loads data from dataloader", async () => {
  const id1 = "10000000-0000-0000-0000-000000000000";
  const id2 = "10000000-0000-0000-0000-000000000001";
  const id3 = "10000000-ffff-0000-0000-000000000002";
  const p1 = loaders.postsById.load(id1);
  const p2 = loaders.postsById.load(id2);
  const p3 = loaders.postsById.load(id3);
  expect((await p1)?.id).toBe(id1);
  expect((await p2)?.id).toBe(id2);
  expect(await p3).toBeNull();
});

if (testLive) {
  // test("load posts by cursor loader", async () => {
  //   const [posts1, posts2] = await Promise.all([
  //     realLoaders.postsByCursor.load([
  //       new Date(),
  //       "10000000-ffff-0000-0000-000000000002",
  //     ]),
  //     realLoaders.postsByCursor.load([
  //       new Date(),
  //       "10000000-ffff-0000-0000-000000000001",
  //     ]),
  //   ]);
  //   expect(posts1.length).toBe(21);
  //   expect(posts2.length).toBe(21);
  // });
}

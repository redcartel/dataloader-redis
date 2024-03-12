import { createClient } from "dataloader-redis/src/nondist/redis-mock";
import { genPrismaMock } from "data-resources/src/testResources/prismaMock";
import { accountLoaderFactory } from "../data-aggregation";
import { accountRepositoryFactory } from "../data-access";

let loaders: ReturnType<typeof accountLoaderFactory>;

beforeEach(() => {
  loaders = accountLoaderFactory(
    createClient() as any,
    accountRepositoryFactory(genPrismaMock() as any),
  );
});

test("loads data from dataloader", async () => {
  const id1 = "00000000-0000-0000-0000-000000000000";
  const id2 = "00000000-0000-0000-0000-000000000001";
  const [account1, account2] = await Promise.all([
    loaders.accountById.load(id1),
    loaders.accountById.load(id2),
  ]);
  expect(account1?.id).toBe(id1);
  expect(account2?.id).toBe(id2);
});

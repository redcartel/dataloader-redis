import { genPrismaMock } from 'data-resources/src/tests/prismaMock';
import { accountRepositoryFactory } from '../data-access';

let accountRepo : ReturnType<typeof accountRepositoryFactory>;

beforeEach(() => {
    accountRepo = accountRepositoryFactory(genPrismaMock() as any);
})

test('should retrieve two users in aggreage query', async () => {
    const ids = ['00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001']
    expect((await accountRepo.accountAggregate(ids)).length).toBe(2);
})

test('should return undefined elements in aggregate query', async () => {
    const ids = ['00000000-0000-0000-0000-000000000000', '00000000-ffff-0000-0000-000000000001']
    const rows = await accountRepo.accountAggregate(ids);
    expect(rows.length).toBe(2);
    expect(rows[1]).toBeUndefined();
})
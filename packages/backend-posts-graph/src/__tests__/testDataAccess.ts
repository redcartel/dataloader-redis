import { genPrismaMock } from 'data-resources/src/testResources/prismaMock';
import { postRepositoryFactory } from "../data-access";
import { PrismaClient } from 'data-resources/src/prisma-connection';
import { config } from 'common-values';

let postRepo : ReturnType<typeof postRepositoryFactory>;
let realPostRepo : ReturnType<typeof postRepositoryFactory>;

const testLive = config.test.liveTest;

beforeEach(() => {
    postRepo = postRepositoryFactory(genPrismaMock() as any, 20)
    if (testLive) {
        realPostRepo = postRepositoryFactory(new PrismaClient(), 20)
    }
})

test('should retrieve two users in aggreage query', async () => {
    const ids = ['10000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001']
    const posts = await postRepo.postByIdsAggregate(ids);
    expect(posts.length).toBe(2);
    expect(posts[0]?.id).toBe('10000000-0000-0000-0000-000000000000');
    expect(posts[1]?.id).toBe('10000000-0000-0000-0000-000000000001');
})

test('should return undefined elements in aggregate query', async () => {
    const ids = ['10000000-0000-0000-0000-000000000000', '00000000-ffff-0000-0000-000000000001']
    const rows = await postRepo.postByIdsAggregate(ids);
    expect(rows.length).toBe(2);
    expect(rows[1]).toBeUndefined();
})

if (testLive) {
    test('aggregate by cursor works', async () => {
        const rows = await realPostRepo.postsByCursorAggregate([[new Date(), 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF'], [new Date(new Date().getTime() - 1000), 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFF1']])
        expect(rows?.length).toBe(2);
        expect(rows[0].length).toBe(21);
        expect(rows[1].length).toBe(21);
        const newCursorTime = rows[0][20].createdAt;
        const newCursorId = rows[0][20].id;
        const moreRows = await realPostRepo.postsByCursorAggregate([[newCursorTime, newCursorId]]);
        expect(moreRows.length).toBe(1);
        expect(moreRows[0].length).toBeGreaterThanOrEqual(2);
        expect(moreRows[0][0].id).toBe(rows[0][20].id);
    });

    test('aggregate by account ID and cursor works', async () => {
        const rows = await realPostRepo.postsByAccountsAndCursorsAggregate([
            [
                '00000000-0000-0000-0000-000000000000',
                new Date(),
                '00000000-0000-0000-0000-000000000000'
            ]
        ])
        expect(rows?.length).toBe(1);
        expect(rows[0].length).toBe(21);
        expect(rows[0][10].authorId).toBe('00000000-0000-0000-0000-000000000000')
    })
}
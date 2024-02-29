import { genPrismaMock } from 'data-resources/src/tests/prismaMock';
import { AccountRepository } from "../data-access";

// jest.mock('../resources/prismaClient', () => ({
//     __esModule: true,
//     prisma: mockDeep<PrismaClient>()
// }));

// import { prisma } from "../resources/prismaClient";

let accountRepo : AccountRepository;

beforeEach(() => {
    accountRepo = new AccountRepository(genPrismaMock() as any);
})

test('should retrieve a user', async () => {
    const id = '00000000-0000-0000-0000-000000000000'
    expect((await accountRepo.accountById(id))?.id).toBe(id);
})

test('should retrieve two users in aggreage query', async () => {
    const ids = ['00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001']
    expect((await accountRepo.accountAggregate(ids)).length).toBe(2);
})
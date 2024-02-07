import DataLoaderRedis from '..';
import { createClient } from '../nondist/redis-mock';

describe('some basics', () => {
    test('1 returns 1', async () => {
        const client = createClient();
        const dlr = new DataLoaderRedis(client as any, async (ids) => ids);
        const x = await dlr.load(1);
        expect(x).toBe(1);
        expect(client.data[dlr.makeKey(1)]).toBe('1')
    })

    test('the original demo', async () => {

        const accessCounts : { [key: number]: number }= {};

        function slowIdentity(keys : readonly number[]) {
            return new Promise<{ val: number }[]>(res => {
                setTimeout(function () { return res(keys.map(key => {
                    accessCounts[key] !== undefined ? accessCounts[key]++ : accessCounts[key] = 1;
                    return {val: key};
                })) }, Math.random() * 1000)
            });
        }

        const client = createClient();


        const loader = new DataLoaderRedis(client as any, slowIdentity, {
            ttl: 5,
            dataLoaderOptions: {
                cache: false,
                cacheMap: undefined
            }
        });
        const [a, b, c] = await Promise.all([loader.load(1), loader.load(2), loader.loadMany([1, 2])]);
        expect(a).toStrictEqual({'val':1});
        expect(b).toStrictEqual({'val':2});
        expect(c).toStrictEqual([{'val': 1},{'val': 2}]);
        const [e, f] = await Promise.all([loader.load(2), loader.load(3)]);
        expect(e).toStrictEqual({'val': 2});
        expect(f).toStrictEqual({'val': 3});
        expect(accessCounts[1]).toBe(1);
        expect(accessCounts[2]).toBe(1);
        expect(accessCounts[3]).toBe(1);
    })
});

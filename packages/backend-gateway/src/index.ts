import { RedisClientType, createClient } from 'redis';
import DataLoaderRedis from 'dataloader-redis';

function slowIdentity(keys : readonly number[]) {
    return new Promise<{ val: number }[]>(res => {
        setTimeout(function () { return res(keys.map(key => ({val: key}))) }, Math.random() * 1000)
    });
}

console.log('redis needs to be running on localhost:6379')

async function go() {
    // turning off in-memory cache for demo, normally in a long running process you'd want to use LRU or something like that
    // key and value types can be anything JSON serializable
    const client = createClient();
    await client.connect();

    const loader = new DataLoaderRedis(client, slowIdentity, {
        ttl: 5,
        options: {
            cache: false,
            cacheMap: undefined
        }
    });
    console.log('going');
    const [a, b, c] = await Promise.all([loader.load(1), loader.load(2), loader.loadMany([1, 2])]);
    console.log(a,b, c);
    const [e, f] = await Promise.all([loader.load(2), loader.load(3)]);
    console.log(e,f)

    console.log(loader.makeKey(1), loader.makeKey(2))

    // await client.disconnect();
}

go();
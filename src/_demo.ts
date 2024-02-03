import { createClient } from 'redis';
import DataLoaderRedis from '.';

function slowIdentity(keys : readonly number[]) {
    return new Promise<readonly number[]>(res => {
        setTimeout(function () { return res(keys) }, Math.random() * 1000)
    });
}

console.log('redis needs to be running on localhost:6379')

async function go() {
    // turning off in-memory cache for demo, normally in a long running process you'd want to use LRU or something like that
    // key and value types can be anything JSON serializable
    const loader = new DataLoaderRedis<number, number>(createClient(), slowIdentity, { options: { cache: false }});
    console.log('going');
    const [a, b, c] = await Promise.all([loader.load(1), loader.load(2), loader.load(3)]);
    console.log(a,b,c);
    const [d, e, f] = await Promise.all([loader.load(1), loader.load(2), loader.load(3)]);
    console.log(d,e,f)
}

go();
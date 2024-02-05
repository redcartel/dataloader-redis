import { LayeredLoader } from './LayeredLoader';
import { createClient } from 'redis';
import stringify from 'json-stable-stringify';
import { BatchLoadFn, Options } from 'dataloader';
import { v3 } from 'murmurhash';

type RedisClientType = ReturnType<typeof createClient>;

type OrError<T> = T | Error;
type OrNull<T> = T | null;

class DataLoaderRedis<K, V, _RedisClientType extends RedisClientType> extends LayeredLoader<K, V> {
    public client : _RedisClientType;

    private _prefix : string;

    public makeKey(key: K) {
        const _key = `${this. _prefix}:${stringify(key)}`;
        return _key.length < 64 ? _key : v3(_key).toString(36);
    }

    constructor(client: _RedisClientType, batchLoad: BatchLoadFn<K, V>, dataloaderRedisOptions?: { prefix?: string, ttl?: number, options?: Options<K,V>}) {
        const { ttl, options} = dataloaderRedisOptions ?? {};
        const _ttl = ttl ?? 60;

        super([
            {
                reader: async (keys: readonly K[]) => {
                    // if (!client?.isReady) {
                    //     console.warn('redis read fail, client not ready');
                    //     return keys.map(_key => new Error('Redis not connected'));
                    // }
                    const vals = (await client.MGET(keys.map(key => `${this.makeKey(key)}`))).map(
                        (result : OrNull<string>) => result === null ? new Error('Not Found') : JSON.parse(result)) as (V | Error)[];
                    
                    return vals;
                },
                writer: async (keys: readonly K[], vals: V[]) => {
                    // if (!client?.isReady) {
                    //     console.warn('redis write fail, client not ready')
                    //     return;
                    // }
                    const multi = client.multi();
                    for (let j = 0; j < keys.length; j++) {
                        const _k = this.makeKey(keys[j]);
                        multi.set(_k, stringify(vals[j]))
                        multi.expire(_k, _ttl);
                    }
                    await multi.exec();
                },
                clear: async (key) => { client.del([this.makeKey(key)]) }
            },
            {
                reader: batchLoad
            }
        ], {...options, noDeduplication: false, waitForCacheWrite: false});

        this._prefix = dataloaderRedisOptions?.prefix ?? v3(batchLoad.toString()).toString(36);
        this.client = client;
    }
}

export default DataLoaderRedis;
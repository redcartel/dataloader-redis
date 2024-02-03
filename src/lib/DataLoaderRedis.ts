import { LayeredLoader } from './LayeredLoader';
import { RedisClientType } from 'redis';
import stringify from 'json-stable-stringify';
import { LRUCache } from 'lru-cache';
import { BatchLoadFn, Options } from 'dataloader';
import { v3 } from 'murmurhash';

class DataLoaderRedis<K extends {}, V extends {}> extends LayeredLoader<K, V> {
    public client : RedisClientType;

    constructor(client: RedisClientType, batchLoad: BatchLoadFn<K, V>, dataloaderRedisOptions?: { ttl?: number, options?: Options<K,V>}) {
        const { ttl, options} = dataloaderRedisOptions ?? {};
        const _ttl = ttl ?? 60;
        const _prefix = v3(batchLoad.toString()).toString(36);

        function makeKey(key: K) {
            const _key = `${_prefix}:${stringify(key)}`;
            return _key.length < 64 ? _key : v3(_key).toString(36);
        }

        client.connect();

        super([
            {
                reader: async (keys: readonly K[]) => {
                    if (!client?.isReady) {
                        console.warn('redis read fail, client not ready');
                        return keys.map(_key => new Error('Redis not connected'));
                    }
                    const vals = (await client.MGET(keys.map(key => `${makeKey(key)}`))).map(result => result === null ? new Error('missing or null') : JSON.parse(result));
                    return vals;
                },
                writer: async (keys: readonly K[], vals: V[]) => {
                    if (!client?.isReady) {
                        console.warn('redis not connected, write fail')
                        return;
                    }
                    const multi = client.multi();
                    for (let j = 0; j < keys.length; j++) {
                        const _k = makeKey(keys[j]);
                        multi.set(_k, stringify(vals[j]))
                        multi.expire(_k, _ttl);
                    }
                    multi.exec();
                }
            },
            {
                reader: batchLoad
            }
        ], {...options, name: options?.name ?? 'RedisLoader', cacheMap: options?.cacheMap ?? new LRUCache<K,Promise<V>>({max: 512, ttl: Math.ceil(_ttl / 4)})});

        this.client = client;
    }
}

export default DataLoaderRedis;
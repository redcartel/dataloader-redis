import { LayeredLoader } from "./LayeredLoader";
import stringify from "json-stable-stringify";
import { v3 } from "murmurhash";
import { LRUCache } from "lru-cache";
import { DataLoaderRedisOptions, OrError, OrNull, _RedisClient } from "./types";

class DataLoaderRedis<K extends {}, V extends {}, M = V> extends LayeredLoader<K, V | M> {
  public client: _RedisClient;

  public prefix: string;

  private missingValue: (key: K) => M;

  public serializeKey = (key: K): string => {
    return stringify(key);
  };

  public serializeValue = (value: V | M): string => {
    return stringify(value);
  };

  public deserializeValue = (serialized: string): OrError<V | M> => {
    return JSON.parse(serialized);
  };

  public makeKey(key: K) {
    return `${this.prefix}:${this.serializeKey(key)}`;
  }

  constructor(
    client: _RedisClient,
    batchLoad: (keys: K[]) => Promise<OrError<V>[]>,
    dataloaderRedisOptions?: DataLoaderRedisOptions<K, V, M>,
  ) {
    const {
      ttl,
      dataloaderOptions: options,
      serializeKey,
      serializeValue,
      deserializeValue,
      missingValue,
    } = dataloaderRedisOptions ?? {};

    const _ttl = ttl ?? 60;

    super(
      [
        {
          reader: async (keys: K[]) => {
            if (!this.client?.isReady) {
              console.warn("redis read fail, client not ready");
              return keys.map((_key) => new Error("Redis not connected"));
            }
            const vals = (
              await this.client.MGET(keys.map((key) => `${this.makeKey(key)}`))
            ).map((result: OrNull<string>) =>
              result === null
                ? new Error("Not Found")
                : this.deserializeValue(result),
            ) as OrError<V>[];

            return vals;
          },
          writer: async (keys: K[], vals: (V | M)[]) => {
            if (!this.client?.isReady) {
              console.warn("redis write fail, client not ready");
              return;
            }
            const multi = this.client.multi();
            for (let j = 0; j < keys.length; j++) {
              const _k = this.makeKey(keys[j]);
              multi.set(_k, this.serializeValue(vals[j]));
              multi.expire(_k, _ttl);
            }
            await multi.exec();
          },
          clear: async (key) => {
            if (!this.client?.isReady) {
              console.warn("redis del fail, client not ready");
              return;
            }
            this.client.del([this.makeKey(key)]);
          },
        },
        {
          reader: batchLoad,
        },
      ],
      {
        ...options,
        noDeduplication: false,
        waitForCacheWrite: false,
        cache: true,
        cacheMap:
          options?.cacheMap ||
          new LRUCache<K, Promise<V | M>>({
            ttl: 500,
            max: 1024,
            ttlAutopurge: true,
          }),
      },
    );

    this.serializeKey = serializeKey ?? this.serializeKey;
    this.serializeValue = serializeValue ?? this.serializeValue;
    this.deserializeValue = deserializeValue ?? this.deserializeValue;
    this.missingValue = missingValue ?? ((key) => { throw new Error('Not Found')});
    this.prefix =
      dataloaderRedisOptions?.prefix ?? v3(batchLoad.toString()).toString(36);
    this.client = client;
  }

  override load(key: K) {
    return super.load(key).catch(e => this.missingValue(e));
  }

  public async scanAndDelete(pattern: string): Promise<void> {
    let cursor = 0;
    do {
      const reply = await this.client.scan(cursor, { MATCH: this.prefix + ':' + pattern, COUNT: 1000 });
      cursor = reply.cursor;
      
      await this.client.del(reply.keys);
    } while (cursor !== 0)
  }
}

export default DataLoaderRedis;

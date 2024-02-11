import { LayeredLoader, OrError, OrNull } from "./LayeredLoader";
import stringify from "json-stable-stringify";
import { BatchLoadFn, Options } from "dataloader";
import { v3 } from "murmurhash";
import { RedisClientType, createClient } from "redis";
import { LRUCache } from "lru-cache";

type _RedisClient = ReturnType<typeof createClient<any, any, any>>;

type DataLoaderRedisOptions<K, V> = {
  prefix?: string;
  ttl?: number;
  dataLoaderOptions?: Options<K, V>;
  serializeKey?: (key: K) => string;
  serializeValue?: (value: V) => string;
  deserializeValue?: (serialized: string) => OrError<V>;
};

class DataLoaderRedis<K extends {}, V extends {}> extends LayeredLoader<K, V> {
  public client: RedisClientType;

  private _prefix: string;

  public serializeKey = (key: K): string => {
    return stringify(key);
  };

  public serializeValue = (value: V): string => {
    return stringify(value);
  };

  public deserializeValue = (serialized: string): OrError<V> => {
    return JSON.parse(serialized);
  };

  public makeKey(key: K) {
    const _key = `${this._prefix}:${this.serializeKey(key)}`;
    return _key.length < 64
      ? _key
      : `${this._prefix}:${v3(this.serializeKey(key)).toString(36)}`;
  }

  constructor(
    client: _RedisClient,
    batchLoad: (keys: K[]) => Promise<OrError<V>[]>,
    dataloaderRedisOptions?: DataLoaderRedisOptions<K, V>,
  ) {
    const {
      ttl,
      dataLoaderOptions: options,
      serializeKey,
      serializeValue,
      deserializeValue,
    } = dataloaderRedisOptions ?? {};

    const _ttl = ttl ?? 60;

    super(
      [
        {
          reader: async (keys: K[]) => {
            if (!client?.isReady) {
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
          writer: async (keys: K[], vals: V[]) => {
            if (!client?.isReady) {
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
            if (!client?.isReady) {
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
          new LRUCache<K, Promise<V>>({
            ttl: 500,
            max: 1024,
            ttlAutopurge: true,
          }),
      },
    );

    this.serializeKey = serializeKey ?? this.serializeKey;
    this.serializeValue = serializeValue ?? this.serializeValue;
    this.deserializeValue = deserializeValue ?? this.deserializeValue;
    this._prefix =
      dataloaderRedisOptions?.prefix ?? v3(batchLoad.toString()).toString(36);
    this.client = client as RedisClientType;
  }
}

export default DataLoaderRedis;

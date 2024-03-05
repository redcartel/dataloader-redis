import { Options } from "dataloader";
import { createClient } from "redis";

export type OrError<T> = T | Error;
export type OrNull<T> = T | null;

export type Layer<K, V> = {
  reader: (keys: K[]) => Promise<OrError<V>[]>;
  writer?: (keys: K[], vals: V[]) => Promise<void>;
  clear?: (key: K) => Promise<void>;
  prime?: (key: K, value: V) => void;
};

export type _RedisClient = ReturnType<typeof createClient<any, any, any>>;

export type DataLoaderRedisOptions<K, V, M> = {
  prefix?: string;
  ttl?: number;
  dataloaderOptions?: Options<K, V>;
  serializeKey?: (key: K) => string;
  serializeValue?: (value: V | M) => string;
  deserializeValue?: (serialized: string) => OrError<V>;
  missingValue?: (key: K) => M;
};
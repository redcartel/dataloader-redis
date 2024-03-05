import DataLoader, { Options, BatchLoadFn } from "dataloader";
import { Layer, OrError } from "./types";

export const _debugLog = (...args: any[]) =>
  process.env["DATALOADER_REDIS_DEBUG"] && console.log(args);

export class LayeredLoader<K, V> extends DataLoader<K, V> {
  private layers: Layer<K, V>[];

  constructor(
    layers: Layer<K, V>[],
    options?: Options<K, V> & {
      noDeduplication?: boolean;
      waitForCacheWrite?: boolean;
    },
  ) {
    super(async (keys: readonly K[]) => {
      let dedupedKeys = options?.noDeduplication ? keys : [...new Set(keys)];

      let len = layers.length;
      if (len === 0) return keys.map((_k) => new Error("no layers provided"));

      async function readWriteLayer(
        idx: number,
        keys: readonly K[],
      ): Promise<(V | Error)[]> {
        _debugLog("readWrite layer " + idx + " received", keys);
        let vals = Array.from(await layers[idx].reader(keys as K[]));
        if (idx < len - 1) {
          let _badKeys = keys.filter(
            (_, idx) => vals[idx] === undefined || vals[idx] instanceof Error,
          );
          if (_badKeys.length > 0) {
            _debugLog("layer " + idx + " bad keys", _badKeys);
            const _nextVals = await readWriteLayer(idx + 1, _badKeys);
            const _updateMap = new Map(
              _badKeys.map((key, idx) => [key, _nextVals[idx]]),
            );

            vals = vals.map((val, idx) => {
              if (val !== undefined && !(val instanceof Error)) {
                return val;
              }
              return _updateMap.get(keys[idx]) ?? new Error("Not Found");
            });

            const _newWriteKeys = _badKeys.filter((key) => {
              const v = _updateMap.get(key);
              if (v === undefined || v instanceof Error) {
                return false;
              }
              return true;
            });

            if (_newWriteKeys.length > 0 && layers[idx].writer) {
              _debugLog("layer " + idx + " writing", _newWriteKeys, _updateMap);
              const prom = layers[idx].writer!(
                _newWriteKeys,
                _newWriteKeys.map((key) => _updateMap.get(key) as V),
              );
              if (options?.waitForCacheWrite) {
                await prom;
              }
            }
          }
        }
        _debugLog("layer " + idx + " returning ", vals);
        return vals;
      }

      const dedupedVals = await readWriteLayer(0, dedupedKeys);

      if (options?.noDeduplication) {
        return dedupedVals;
      }

      const kvMap = new Map<K, OrError<V>>(
        dedupedKeys.map((key, idx) => [key, dedupedVals[idx]]),
      );

      return keys.map((key) => kvMap.get(key) ?? new Error("Not Found"));
    }, options);

    this.layers = layers;
  }

  public async asyncClear(key: K) {
    super.clear(key);
    await Promise.all(
      this.layers.map((layer) => layer.clear && layer.clear(key)),
    );
  }

  override clear(key: K): this {
    this.asyncClear(key);
    return this;
  }

  override clearAll() {
    console.warn(
      "outer dataloader cache cleared, intermediate layers not cleared",
    );
    super.clearAll();
    return this;
  }

  public async asyncPrime(key: K, value: OrError<V> | Promise<V>) {
    const v = await value;
    if (v instanceof Error) {
      await this.asyncClear(key);
      return;
    }
    super.prime(key, value);
    await Promise.all(
      this.layers.map((layer) => layer.writer && layer.writer([key], [v])),
    );
  }

  override prime(key: K, value: OrError<V> | Promise<V>): this {
    this.asyncPrime(key, value);
    return this;
  }
}

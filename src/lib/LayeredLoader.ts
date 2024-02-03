import DataLoader, { Options, BatchLoadFn } from "dataloader";

export type Layer<K,V> = {
    reader: BatchLoadFn<K,V>,
    writer?: (keys: K[], vals: V[]) => Promise<void>
}

export class LayeredLoader<K, V> extends DataLoader<K, V> {
    
    constructor(layers: Layer<K,V>[], options?: Options<K, V>) {

        super(async (keys: readonly K[]) => {
            let len = layers.length;
            if (len === 0) return keys.map(_k => new Error('no layers provided'));
            
            async function readWriteLayer(idx: number, keys: readonly K[]) : Promise<(V | Error)[]> {
                let vals = Array.from(await layers[idx].reader(keys));
                let _badKeys : K[] = [];
                if (idx < len - 1) {
                    for (let i = 0; i < vals.length; i++) {
                        if (vals[i] instanceof Error) {
                            _badKeys.push(keys[i]);
                        }
                    }
                    if (_badKeys.length > 0) {
                        let _nextVals = await readWriteLayer(idx + 1, _badKeys);
                        let _lastIdx = 0;
                        for (let j = 0; j < vals.length; j++) {
                            if (vals[j] instanceof Error) {
                                vals[j] = _nextVals[_lastIdx];
                                _lastIdx++
                            }
                        }
                        let _writeKeys : K[] = [];
                        let _writeVals : V[] = [];
                        for (let k = 0; k < _nextVals.length; k++) {
                            if (!(_nextVals[k] instanceof Error)) {
                                _writeKeys.push(_badKeys[k]);
                                _writeVals.push(_nextVals[k] as V);
                            }
                        }
                        if (_writeVals.length > 0 && layers[idx].writer) {
                            await layers[idx].writer!(_writeKeys, _writeVals);
                        }
                    }
                }
                return vals;
            }

            return await readWriteLayer(0, keys);
        }, options);
    }
}
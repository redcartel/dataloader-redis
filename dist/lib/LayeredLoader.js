"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayeredLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
class LayeredLoader extends dataloader_1.default {
    constructor(layers, options) {
        super((keys) => __awaiter(this, void 0, void 0, function* () {
            let len = layers.length;
            if (len === 0)
                return keys.map(_k => new Error('no layers provided'));
            function readWriteLayer(idx, keys) {
                return __awaiter(this, void 0, void 0, function* () {
                    let vals = Array.from(yield layers[idx].reader(keys));
                    let _badKeys = [];
                    if (idx < len - 1) {
                        for (let i = 0; i < vals.length; i++) {
                            if (vals[i] instanceof Error) {
                                _badKeys.push(keys[i]);
                            }
                        }
                        if (_badKeys.length > 0) {
                            let _nextVals = yield readWriteLayer(idx + 1, _badKeys);
                            let _lastIdx = 0;
                            for (let j = 0; j < vals.length; j++) {
                                if (vals[j] instanceof Error) {
                                    vals[j] = _nextVals[_lastIdx];
                                    _lastIdx++;
                                }
                            }
                            let _writeKeys = [];
                            let _writeVals = [];
                            for (let k = 0; k < _nextVals.length; k++) {
                                if (!(_nextVals[k] instanceof Error)) {
                                    _writeKeys.push(_badKeys[k]);
                                    _writeVals.push(_nextVals[k]);
                                }
                            }
                            if (_writeVals.length > 0 && layers[idx].writer) {
                                yield layers[idx].writer(_writeKeys, _writeVals);
                            }
                        }
                    }
                    return vals;
                });
            }
            return yield readWriteLayer(0, keys);
        }), options);
    }
}
exports.LayeredLoader = LayeredLoader;

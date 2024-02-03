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
const LayeredLoader_1 = require("./LayeredLoader");
const json_stable_stringify_1 = __importDefault(require("json-stable-stringify"));
const lru_cache_1 = require("lru-cache");
const murmurhash_1 = require("murmurhash");
class DataloaderRedis extends LayeredLoader_1.LayeredLoader {
    constructor(client, batchLoad, { ttl, options }) {
        var _a, _b;
        const _ttl = ttl !== null && ttl !== void 0 ? ttl : 60;
        const _prefix = (0, murmurhash_1.v3)(batchLoad.toString()).toString(36);
        function makeKey(key) {
            const _key = `${_prefix}:${(0, json_stable_stringify_1.default)(key)}`;
            return _key.length < 64 ? _key : (0, murmurhash_1.v3)(_key).toString(36);
        }
        client.connect();
        super([
            {
                reader: (keys) => __awaiter(this, void 0, void 0, function* () {
                    if (!(client === null || client === void 0 ? void 0 : client.isReady)) {
                        return keys.map(_key => new Error('Redis not connected'));
                    }
                    const vals = (yield client.MGET(keys.map(key => `${makeKey(key)}`))).map(result => result === null ? new Error('missing or null') : JSON.parse(result));
                    return vals;
                }),
                writer: (keys, vals) => __awaiter(this, void 0, void 0, function* () {
                    if (!(client === null || client === void 0 ? void 0 : client.isReady)) {
                        console.warn('redis not connected, write fail');
                        return;
                    }
                    const multi = client.multi();
                    for (let j = 0; j < keys.length; j++) {
                        const _k = makeKey(keys[j]);
                        multi.set(_k, (0, json_stable_stringify_1.default)(vals[j]));
                        multi.expire(_k, _ttl);
                    }
                    multi.exec();
                })
            },
            {
                reader: batchLoad
            }
        ], Object.assign(Object.assign({}, options), { name: (_a = options === null || options === void 0 ? void 0 : options.name) !== null && _a !== void 0 ? _a : 'RedisLoader', cacheMap: (_b = options === null || options === void 0 ? void 0 : options.cacheMap) !== null && _b !== void 0 ? _b : new lru_cache_1.LRUCache({ max: 512, ttl: Math.ceil(_ttl / 4) }) }));
        this.client = client;
    }
}
exports.default = DataloaderRedis;

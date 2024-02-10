import { RedisClientType, createClient } from 'redis';

let _client : RedisClientType;

export function makeRedisConnection() {
    _client ??= createClient({
        url: process.env['REDIS_URL'] ?? undefined
    });
    if (!_client.isReady) {
        _client.connect();
    }
    return _client;
}
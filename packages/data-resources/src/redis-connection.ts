import { createClient } from 'redis';

export function makeRedisConnection() {
    return createClient({
        url: process.env['REDIS_URL'] ?? undefined
    });
}
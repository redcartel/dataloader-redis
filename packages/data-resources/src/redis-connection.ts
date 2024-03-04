import { config } from "common-values";
import { RedisClientType, createClient } from "redis";

let _client: RedisClientType;

export function makeRedisConnection() {
  _client = _client ?? createClient({
    url: config.redis.url,
  });
  return _client;
}

import { config } from "common-values";
import { RedisClientType, createClient } from "redis";

let _client: RedisClientType;

export function makeRedisConnection() {
  _client ??= createClient({
    url: config.redis.url,
  });
  try {
    if (!_client.isReady) {
      _client.connect();
    }
  } catch (e) {
    console.warn(e);
  }
  return _client;
}

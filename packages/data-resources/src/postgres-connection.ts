import { config } from "common-values";
import { Pool } from "pg";

let _pool: Pool;

export function makePostgresConnection(min = 2, max = 10) {
  _pool ??= new Pool({
    host: config.postgres.host as string,
    user: config.postgres.user as string,
    password: config.postgres.password as string,
    database: config.postgres.db as string,
    port: config.postgres.port,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    ssl: config.postgres.host?.match(/^localhost|^db/)
      ? false
      : {
          rejectUnauthorized: false,
        },
    max,
    min,
  });

  return _pool;
}

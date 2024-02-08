import { Pool } from "pg";

console.log(process.env['POSTGRES_HOST']);

export function makePostgresConnection(min = 2, max = 10) {
    return new Pool({
        host: process.env['POSTGRES_HOST'],
        user: process.env['POSTGRES_USER'],
        password: process.env['POSTGRES_PASSWORD'],
        database: process.env['POSTGRES_DB'],
        port: parseInt(process.env['POSTGRES_PORT'] ?? '5432'),
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
        ssl: process.env['POSTGRES_HOST']?.match('localhost') ? false : {
            rejectUnauthorized: false,
        },
        max,
        min
    })
}
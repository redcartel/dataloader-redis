import { Pool } from 'pg';

const connection = new Pool({
    host: process.env['POSTGRES_HOST'],
    user: process.env['ROOT_POSTGRES_USER'],
    password: process.env['ROOT_POSTGRES_PASSWORD'],
    database: process.env['ROOT_POSTGRES_DB'],
    port: parseInt(process.env['POSTGRES_PORT'] ?? '5432'),
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    ssl: process.env['POSTGRES_HOST']?.match('localhost') ? false : {
        rejectUnauthorized: false,
    },
    max: 10,
    min: 2
})

connection.connect();

async function localDevSetup() {
    await connection.query(`CREATE USER appuser WITH SUPERUSER PASSWORD 'password'`)
    await connection.query(`CREATE DATABASE appdb WITH OWNER=appuser`)
    await connection.query(`CREATE DATABASE appdb_shadow WITH OWNER=appuser`)
}

localDevSetup();
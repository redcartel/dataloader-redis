import { makePostgresConnection } from "data-resources/src/postgres-connection";
import { Pool } from "pg";

export interface PostType {
    id?: string,
    accounts_id?: string,
    body?: string,
    created_at?: string,
    updated_at?: string
}

export interface LikeType {
    id?: string,
    accounts_id?: string,
    posts_id?: string,
    created_at?: string,
    updated_at?: string
}

export default class PostRepository {

    private connection : ReturnType<typeof makePostgresConnection>

    constructor(postgresPool: Pool) {
        this.connection = postgresPool;
    }

    private postRowMap(row : any) : PostType {
        return {
            id: row.id,
            accounts_id: row.accounts_id,
            body: row.body,
            created_at: row.created_at.toISOString(),
            updated_at: row.updated_at.toISOString()
        }
    }

    private likeRowMap(row: any) : LikeType {
        return {
            id: row.id,
            accounts_id: row.accounts_id,
            posts_id: row.posts_id,
            created_at: row.created_at.toISOString(),
            updated_at: row.updated_at.toISOString()
        }
    }

    async postById(id: string) {
        const queryString = `SELECT id, accounts_id, body, created_at, updated_at FROM posts WHERE id = $1 LIMIT 1`;
        const result = await this.connection.query(queryString, [id])
        if (result.rows.length !== 1) {
            return new Error('Not Found');
        }
        else return this.postRowMap(result.rows[0]);
    }

    async postAggregate(ids: string[]) {
        const queryString = `SELECT id, accounts_id, body, created_at, updated_at FROM posts WHERE id = ANY($1)`;
        const result = await this.connection.query(queryString, [ids]);
        let resultMap : { [key: string]: PostType} = {};
        result.rows.forEach(row => resultMap[row['id']] = this.postRowMap(row));
        return ids.map(id => resultMap[id] ?? new Error('Not Found'));
    }

    async postsByAccountAggregate(ids: string[]) {
        const queryString = `SELECT id, accounts_id, body, created_at, updated_at FROM posts WHERE accounts_id = ANY($1)`;
        const result = await this.connection.query(queryString, [ids]);
        let resultMap : { [key: string]: PostType[] } = {};
        result.rows.forEach(row => {
            if (!resultMap[row['accounts_id']]) {
                resultMap[row['accounts_id']] = [this.postRowMap(row)];
            }
            else {
                resultMap[row['accounts_id']].push(this.postRowMap(row));
            }
        })
        return ids.map(id => resultMap[id] ?? []);
    }

    async likesByPostAggregate(ids: string[]) {
        const queryString = `SELECT id, posts_id, accounts_id, created_at, updated_at FROM accounts_favorites_posts WHERE posts_id = ANY($1)`;
        const result = await this.connection.query(queryString, [ids]);
        let resultMap : { [key: string]: LikeType[]} = {};
        result.rows.forEach(row => {
            if (!resultMap[row['posts_id']]) {
                resultMap[row['posts_id']] = [this.likeRowMap(row)]
            }
            else {
                resultMap[row['posts_id']].push(this.likeRowMap(row));
            }
        });
        return ids.map(id => resultMap[id] ?? []);
    }

    async likesByAccountAggregate(ids: string[]) {
        const queryString = `SELECT id, posts_id, accounts_id, created_at, updated_at FROM accounts_favorites_posts WHERE accounts_id = ANY($1)`;
        const result = await this.connection.query(queryString, [ids]);
        let resultMap : { [key: string]: LikeType[]} = {};
        result.rows.forEach(row => {
            if (!resultMap[row['accounts_id']]) {
                resultMap[row['accounts_id']] = [this.likeRowMap(row)]
            }
            else {
                resultMap[row['accounts_id']].push(this.likeRowMap(row));
            }
        });
        return ids.map(id => resultMap[id] ?? []);
    }

    async likesCountByPostAggregate(ids: string[]) {
        const queryString = `SELECT posts_id, COUNT(*) FROM accounts_favorites_posts WHERE posts_id = ANY($1) GROUP BY posts_id`;
        const result = await this.connection.query(queryString, [ids]);
        let resultMap : { [key: string] : number } = {}
        result.rows.forEach(row => {
            resultMap[row['posts_id']] = parseInt(`${row['count']}`);
        })
        return ids.map(id => resultMap[id] ?? 0);
    }
}
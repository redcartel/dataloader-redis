import { makePostgresConnection } from "data-resources/src/postgres-connection";
import { Pool } from "pg";

export interface PostType {
    id?: string,
    accounts_id?: string,
    body?: string
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
            body: row.body
        }
    }

    async postById(id: string) {
        const queryString = `SELECT id, accounts_id, body FROM posts WHERE id = $1 LIMIT 1`;
        const result = await this.connection.query(queryString, [id])
        if (result.rows.length !== 1) {
            return new Error('Not Found');
        }
        else return this.postRowMap(result.rows[0]);
    }

    async postAggregate(ids: string[]) {
        const queryString = `SELECT id, accounts_id, body FROM posts WHERE id = ANY($1)`;
        const result = await this.connection.query(queryString, [ids]);
        let resultMap : { [key: string]: PostType} = {};
        result.rows.forEach(row => resultMap[row['id']] = this.postRowMap(row));
        return ids.map(id => resultMap[id] ?? new Error('Not Found'));
    }

    async postsByAccountAggregate(ids: string[]) {
        const queryString = `SELECT id, accounts_id, body FROM posts WHERE accounts_id = ANY($1)`;
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
        console.log(ids, resultMap);
        return ids.map(id => resultMap[id] ?? []);
    }
}
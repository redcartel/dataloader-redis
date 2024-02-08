import { makePostgresConnection } from "data-resources/src/postgres-connection";

export interface AccountType {
    id?: string,
    email?: string,
    username?: string
}

export class AccountRepository {

    private connection : ReturnType<typeof makePostgresConnection>

    constructor() {
        console.log('connecting to postgres...');
        this.connection = makePostgresConnection();
    }

    private accountRowMap(row : any) : AccountType {
        return {
            id: row.id,
            username: row.username,
            email: row.email
        }
    }

    async accountById(id: string) {
        const queryString = `SELECT id, email, username FROM accounts WHERE id = $1 LIMIT 1`;
        const result = await this.connection.query(queryString, [id])
        if (result.rows.length !== 1) {
            return new Error('Not Found');
        }
        else return this.accountRowMap(result.rows[0]);
    }

    async accountsPage(pageNumber = 0, pageSize = 10) {
        const queryString = `SELECT id, email, username FROM accounts LIMIT $1 OFFSET $2`;
        const result = await this.connection.query(queryString, [pageSize, pageNumber * pageSize]);
        return result.rows.map(row => this.accountRowMap(row));
    }

    async accountAggregate(ids: string[]) {
        const queryString = `SELECT id, email, username FROM accounts WHERE id = ANY($1)`;
        const result = await this.connection.query(queryString, [ids])
        let resultMap : { [key: string]: AccountType} = {};
        result.rows.forEach(row => resultMap[row['id']] = this.accountRowMap(row));
        return ids.map(id => resultMap[id] ?? new Error('Not Found'));
    }
}

let _repo : AccountRepository;

export function getAccountsRepository() {
    _repo ??= new AccountRepository();
    return _repo;
}
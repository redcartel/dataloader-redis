import { Pool } from "pg";
import { uuidv7 } from "uuidv7";

export interface PostType {
  id?: string;
  accounts_id?: string;
  body?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PostsCursorType {
  posts: PostType[];
  cursor?: Date
}

export interface LikesCursorType {
  likes: LikeType[];
  cursor?: Date
}

export interface LikeType {
  id?: string;
  posts_id?: string;
  accounts_id?: string;
  created_at?: string;
  updated_at?: string;
}

export default class PostRepository {
  private connection: Pool;

  constructor(postgresPool: Pool) {
    this.connection = postgresPool;
  }

  private postRowMap(row: any): PostType {
    return {
      id: row.id,
      accounts_id: row.accounts_id,
      body: row.body,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
    };
  }

  private likeRowMap(row: any): LikeType {
    return {
      id: row.id,
      posts_id: row.posts_id,
      accounts_id: row.acccounts_id,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
    };
  }

  async postById(id: string) {
    const queryString = `SELECT id, accounts_id, body, created_at, updated_at FROM posts WHERE id = $1 LIMIT 1`;
    const result = await this.connection.query(queryString, [id]);
    if (result.rows.length !== 1) {
      return new Error("Not Found");
    } else return this.postRowMap(result.rows[0]);
  }

  async postsByCursor(cursor?: Date, limit: number = 20) : Promise<PostsCursorType> {
    if (!cursor) {
      cursor = new Date();
    }
    if (limit > 100) {
      limit = 100;
    }
    const queryString = `SELECT id, accounts_id, body, created_at, updated_at FROM posts WHERE created_at <= $1 ORDER BY created_at DESC LIMIT $2`;
    const result = await this.connection.query(queryString, [cursor, limit + 1])
    if (result.rows?.length === limit + 1) {
      return {
        posts: result.rows.slice(0, limit).map(row => this.postRowMap(row)),
        cursor: new Date(result.rows[limit].created_at)
      }
    }
    else {
      return {
        posts: result.rows.map(row => this.postRowMap(row)),
        cursor: undefined
      }
    }
  }

  async postsByAccountAndCursor(accountId: string, cursor: Date, limit: number = 20) : Promise<PostsCursorType> {
    const queryString = `SELECT id, accounts_id, body, created_at, updated_at FROM posts WHERE accounts_id = $1 created_at <= $2 ORDER BY created_at DESC LIMIT $3`;
    const result = await this.connection.query(queryString, [accountId, cursor, limit + 1]);
    if (result.rows?.length === limit + 1) {
      return {
        posts: result.rows.slice(0,limit).map(row => this.postRowMap(row)),
        cursor: result.rows[limit].created_at
      }
    }
    else {
      return {
        posts: result.rows.map(row => this.postRowMap(row)),
        cursor: undefined
      }
    }
  }
  
  async likesByPostAndCursor(posts_id: string, cursor: Date, limit: number = 20): Promise<LikesCursorType> {
    const queryString = `SELECT id, accounts_id, posts_id, created_at, updated_at FROM posts WHERE posts_id = $1 created_at <= $2 ORDER BY created_at DESC LIMIT $3`;
    const result = await this.connection.query(queryString, [posts_id, cursor, limit + 1]);
    if (result.rows.length === limit + 1) {
      return {
        likes: result.rows.slice(0, limit).map(row => this.likeRowMap(row)),
        cursor: result.rows[limit].created_at
      }
    }
    else {
      return {
        likes: result.rows.map(row => this.likeRowMap(row)),
        cursor: undefined
      }
    }
  }

  async insertPost(accountsId : string, body: string) {
    const queryString = /* SQL */`INSERT INTO posts (id, accounts_id, body) VALUES ($1, $2, $3) RETURNING id, accounts_id, body, created_at, updated_at`;
    const result = await this.connection.query(queryString, [uuidv7(), accountsId, body]);
    if (result.rows.length < 1) {
      return new Error("Not Created");
    }
    else return this.postRowMap(result.rows[0]);
  }

  async likePost(accountsId: string, postsId: string) {
    const queryString = `INSERT INTO accounts_favorites_posts (id, accounts_id, posts_id) VALUES ($1, $2, $3) RETURNING id, posts_id, accounts_id, created_at, updated_at`;
    const result = await this.connection.query(queryString, [uuidv7(), accountsId, postsId]);
    if (result.rows.length < 1) {
      return null;
    }
    return this.likeRowMap(result.rows[0]);
  }

  async unlikePost(accountsId: string, postsId: string) {
    const queryString = `DELETE FROM accounts_favorites_posts WHERE accounts_id = $1 AND posts_id = $2`
    return null;
  }

  async postByIdsAggregate(ids: string[]) {
    const queryString = `SELECT id, accounts_id, body, created_at, updated_at FROM posts WHERE id = ANY($1)`;
    const result = await this.connection.query(queryString, [ids]);
    let resultMap: { [key: string]: PostType } = {};
    result.rows.forEach((row) => {
      resultMap[row.id] = row;
    });
    return ids.map((id) => resultMap[id] ?? new Error("Not Found"));
  }

  // TODO: better sql
  async likesCountByPostAggregate(ids: string[]) {
    const queryString = `SELECT posts_id, COUNT(*) FROM accounts_favorites_posts WHERE posts_id = ANY($1) GROUP BY posts_id`;
    const result = await this.connection.query(queryString, [ids]);
    let resultMap: { [key: string]: number } = {};
    result.rows.forEach((row) => {
      resultMap[row["posts_id"]] = parseInt(`${row["count"]}`);
    });
    return ids.map((id) => resultMap[id] ?? 0);
  }

  // TODO: better sql
  async postsByCursorAggregate(cursors: Date[], limit = 20) {
    return Promise.all(cursors.map(cursor => this.postsByCursor(cursor), limit));
  }

  // TODO: better sql
  async postsByAccountsAndCursorsAggregate(accountCursors : [string, Date][], limit = 20) {
    return Promise.all(accountCursors.map(([accountId, cursor]) => this.postsByAccountAndCursor(accountId, cursor, limit)));
  }

  async likesByPostsAndCursorsAggregate(postsCursors: [string, Date][], limit = 20) {
    return Promise.all(postsCursors.map(([postId, cursor]) => this.likesByPostAndCursor(postId, cursor, limit)));
  }
}

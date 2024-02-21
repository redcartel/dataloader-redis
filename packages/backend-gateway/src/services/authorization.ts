import { Pool } from "pg";
import { Response } from "express";
import { RedisClientType } from "redis";
import supertokens from "supertokens-node";
import { config } from "common-values";
import { IncomingHttpHeaders } from "http";

// TODO: simplify this
export async function getAccountFromSession(
  session: any,
  headers: IncomingHttpHeaders,
  redis: RedisClientType,
  postgres: Pool,
) {
  let userId = session?.userId;
  if (!userId) {
    if (config.auth.devSpoof && config.isDev) {
      userId = headers.authorization?.slice(7);
      console.log(userId);
    }
    if (!userId) {
      return {};
    }
  }
  const redisKey = `sessionAccount:${userId}`;
  const redisUser = await redis.get(redisKey);
  let accountData: { email?: string; id?: string } = {};
  if (redisUser !== null && JSON.parse(redisUser)["email"]) {
    console.log(redisUser);
    return JSON.parse(redisUser) as typeof accountData;
  } else {
    const userData = await supertokens.getUser(userId);
    console.log(userData);
    if ((userData?.emails.length ?? 0) > 0) {
      const query = `SELECT email, id FROM accounts WHERE id=$1`;
      const result = await postgres.query(query, [userId]);
      console.log("select, ", result.rows);
      if (result.rows.length >= 1) {
        if (result.rows[0]["email"] === userData!.emails[0]) {
          accountData = {
            email: result.rows[0]["email"],
            id: result.rows[0]["id"],
          };
        } else {
          const updateQuery = `UPDATE accounts SET email = $1 WHERE id=$2 RETURNING email, id`;
          const result = await postgres.query(updateQuery, [
            userData!.emails[0],
            userId,
          ]);
          console.log("update, ", result.rows);
          accountData = {
            email: result.rows[0]["email"],
            id: result.rows[0]["id"],
          };
        }
      } else {
        const insertQuery = `INSERT INTO accounts (id, email, username) VALUES ($1, $2, $3) RETURNING email, id`;
        const result = await postgres.query(insertQuery, [
          userId,
          userData!.emails[0],
          userData!.emails[0].slice(0, 15),
        ]);
        console.log("insert, ", result.rows);
        accountData = {
          email: result.rows[0]["email"],
          id: result.rows[0]["id"],
        };
      }
    }
    console.log(accountData);
    redis.set(redisKey, JSON.stringify(accountData), {
      EX: 60,
    });
    return accountData;
  }
}


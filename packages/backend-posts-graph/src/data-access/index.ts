import { config } from "common-values";
import { Prisma } from "data-resources/src/generated/prismaClient";
import { PrismaClient } from "data-resources/src/prisma-connection";
import { Pool } from "pg";
import { uuidv7 } from "uuidv7";

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

const defaultSelect = {
  id: true,
  body: true,
  authorId: true,
  updatedAt: true,
  createdAt: true,
};

export function postRepositoryFactory(
  connection: PrismaClient,
  limit?: number,
) {
  limit = limit ?? config.backend.pageLimit;

  return {
    async postByIdsAggregate(ids: string[]) {
      const result = await connection.post.findMany({
        select: defaultSelect,
        where: {
          id: {
            in: ids,
          },
        },
      });
      const idMap: { [key: string]: ArrayElement<typeof result> } = {};
      result.forEach((row) => (idMap[row.id] = row));
      return ids.map((id) => idMap[id]);
    },

    async postsByCursorAggregate(cursors: [Date, string][]) {
      const timestampArray = cursors.map(
        ([time, _id]) => time.getTime() / 1000,
      );
      const idArray = cursors.map(([_time, id]) => `${id}`);

      const result = await connection.$queryRaw<Array<any>>`
    WITH cursor_pairs AS (
      SELECT * FROM unnest(ARRAY[${timestampArray}], ARRAY[${idArray}]) AS cp(cursor_timestamp, cursor_id)
    )
    SELECT to_timestamp(cp.cursor_timestamp) as cursor_timestamp, uuid(cp.cursor_id) as cursor_id, p.*
    FROM cursor_pairs cp
    CROSS JOIN LATERAL (
      SELECT * 
      FROM "public"."Post"
      WHERE ("createdAt" < to_timestamp(cp.cursor_timestamp) OR ("createdAt" = to_timestamp(cp.cursor_timestamp) AND "id" <= uuid(cp.cursor_id)))
      ORDER BY "createdAt" DESC, id DESC
      LIMIT ${limit! + 1}
    ) p;
  `.catch((e) => {
        console.error(e);
      });
      const keyFromRow = (row) =>
        `${row.cursor_timestamp.toISOString()} ${row.cursor_id.toLowerCase()}`;
      const map: { [key: string]: Array<any> } = {};
      result?.forEach((row) => {
        if (map[keyFromRow(row)] === undefined) {
          map[keyFromRow(row)] = [];
        }
        map[keyFromRow(row)].push(row);
      });
      return cursors.map(
        (cursor) =>
          map[
            keyFromRow({ cursor_timestamp: cursor[0], cursor_id: cursor[1] })
          ],
      );
    },

    // TODO: better sql
    async postsByAccountsAndCursorsAggregate(
      accountCursors: [string, Date, string][],
    ) {
      const accountIdArray = accountCursors.map(
        ([accountId, _time, _id]) => `${accountId}`,
      );
      const timestampArray = accountCursors.map(
        ([_accountId, time, _id]) => time.getTime() / 1000,
      );
      const idArray = accountCursors.map(([_accountId, _time, id]) => `${id}`);

      const result = await connection.$queryRaw<Array<any>>`
    WITH account_cursor_tuples AS (
      SELECT * FROM unnest(ARRAY[${timestampArray}], ARRAY[${idArray}], ARRAY[${accountIdArray}]) AS cp(cursor_timestamp, cursor_id, account_id)
    )
    SELECT to_timestamp(cp.cursor_timestamp) as cursor_timestamp, uuid(cp.cursor_id) as cursor_id, p.*
    FROM account_cursor_tuples cp
    CROSS JOIN LATERAL (
      SELECT * 
      FROM "public"."Post"
      WHERE "authorId" = uuid(cp.account_id) AND ("createdAt" < to_timestamp(cp.cursor_timestamp) OR ("createdAt" = to_timestamp(cp.cursor_timestamp) AND "id" <= uuid(cp.cursor_id)))
      ORDER BY "createdAt" DESC, id DESC
      LIMIT ${limit! + 1}
    ) p;
  `.catch((e) => {
        console.error(e);
      });
      const keyFromRow = (row) =>
        `${row.authorId.toLowerCase()} ${row.cursor_timestamp.toISOString()} ${row.cursor_id.toLowerCase()}`;
      const map: { [key: string]: Array<any> } = {};
      result?.forEach((row) => {
        if (map[keyFromRow(row)] === undefined) {
          map[keyFromRow(row)] = [];
        }
        map[keyFromRow(row)].push(row);
      });
      return accountCursors.map(
        (cursor) =>
          map[
            keyFromRow({
              authorId: cursor[0],
              cursor_timestamp: cursor[1],
              cursor_id: cursor[2],
            })
          ],
      );
    },
    async insertPost(authorId: string, body: string) {
      const result = await connection.post.create({
        select: defaultSelect,
        data: {
          id: uuidv7(),
          body,
          authorId,
        },
      });
      return result;
    },
  };
}

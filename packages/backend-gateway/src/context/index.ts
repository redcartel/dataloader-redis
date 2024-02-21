import { YogaInitialContext } from "graphql-yoga";
import { Pool } from "pg";
import { Request } from "express";
import { getAccountFromSession } from "../services/authorization";
import { Session } from "inspector";
import supertokens from "supertokens-node";
import { RedisClientType } from "redis";

export type GatewayContext = YogaInitialContext;

export function contextFactory(redis: RedisClientType, postgres: Pool) {
  return async (context: any) => {
    const req : Request = context.req;
    const account = await getAccountFromSession(
      (req as any).session,
      req.headers,
      redis,
      postgres,
    );
    return { ...context, account, postgres };
  };
}

import { YogaInitialContext } from "graphql-yoga";
import { Request } from "express";
import { getAccountFromSession } from "../services/authorization";
import { RedisClientType } from "redis";
import { PrismaClient } from "data-resources/src/generated/prismaClient";

export type GatewayContext = YogaInitialContext;

export function contextFactory(redis: RedisClientType, connection: PrismaClient) {

  return async (context: any) => {
    const req : Request = context.req;
    const account = await getAccountFromSession(
      (req as any).session,
      req.headers,
      redis,
      connection,
    );
    return { ...context, account }; // + account
  };
}

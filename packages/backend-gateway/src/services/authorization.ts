import { RedisClientType } from "redis";
import supertokens from "supertokens-node";
import { config } from "common-values";
import { IncomingHttpHeaders } from "http";
import { PrismaClient } from "data-resources/src/generated/prismaClient";

// TODO: simplify this
export async function getAccountFromSession(
  session: any,
  headers: IncomingHttpHeaders,
  redis: RedisClientType,
  client: PrismaClient,
) {
  let userId = session?.userId;
  if (!userId) {
    if (config.auth.devSpoof && config.isDev) {
      userId = headers.authorization?.slice(7);
    }
    if (!userId) {
      return {};
    } else {
      console.log("spoof: ", userId);
      return {
        email: "spoof@example.com",
        id: userId,
        username: "spoofed user",
      };
    }
  }
  const redisKey = `sessionAccount:${userId}`;
  if (!redis.isReady) {
    try {
      await redis.connect();
    } catch (e) {
      console.error(e);
    }
  }
  const redisUser = await redis.get(redisKey);
  console.log("redis user: ", redisUser);
  let accountData: { email?: string; id?: string; username?: string } = {};
  if (redisUser !== null && JSON.parse(redisUser)["email"]) {
    console.log(redisUser);
    return JSON.parse(redisUser) as typeof accountData;
  } else {
    const userData = await supertokens.getUser(userId);
    console.log(userData);
    if ((userData?.emails.length ?? 0) > 0) {
      const result = await client.account.findUnique({ where: { id: userId } });
      console.log("select, ", result);
      if (result) {
        if (result.email === userData!.emails[0]) {
          accountData = {
            email: result.email,
            id: result.id,
            username: result.username,
          };
        } else {
          const result = await client.account.update({
            select: { id: true, email: true, username: true },
            where: { id: userId },
            data: { email: userData!.emails[0] },
          });
          console.log("update, ", result);
          accountData = {
            email: result.email,
            id: result.id,
            username: result.username,
          };
        }
      } else {
        const result = await client.account.create({
          select: { id: true, username: true, email: true },
          data: {
            id: userId,
            email: userData!.emails[0],
            username: userData!.emails[0],
          },
        });
        console.log("insert, ", result);
        accountData = {
          email: result.email,
          id: result.username,
          username: result.username,
        };
      }
    }
    console.log("accountData", accountData);
    redis.set(redisKey, JSON.stringify(accountData), {
      EX: 60,
    });
    return accountData;
  }
}

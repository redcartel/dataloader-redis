import { Response } from "express";
import { encodeToken, login } from "../services/authorization";
import { Pool } from "pg";

export const resolvers = {
    Query: {
        me: (_source, { }, context) => {
            console.log(context.account);
            return context.account;
        }
    },
    Mutation: {
        login: async (_source, { username, password }, { postgres, res, req }: { postgres: Pool, res: Response, req: Request }) => {
            const account = await login(postgres, username.toLowerCase(), password);
            if (account?.email) {
                res.cookie('token', encodeToken({
                    username: account?.username?.toLowerCase() as string,
                    email: account?.email
                }), {
                    httpOnly: true,
                    sameSite: 'lax',
                    domain: process.env['COOKIE_DOMAIN'] ?? 'localhost',
                    maxAge: 36000000
                });
                return {
                    username: account.username?.toLowerCase(),
                    email: account.email
                }
            }
            else {
                res.cookie('token', '', {
                    httpOnly: true,
                    sameSite: 'lax',
                    domain: process.env['COOKIE_DOMAIN'] ?? 'localhost',
                    maxAge: 36000000
                });
                return {
                }
            }
        }
    }
}
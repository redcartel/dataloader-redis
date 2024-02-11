import { Response } from "express";
import { encodeToken, login, setAccountCookie } from "../services/authorization";
import { Pool } from "pg";

export const resolvers = {
    Query: {
        me: (_source, { }, context) => {
            if (context.account) {
                const token = encodeToken({email: context.account.email, username: context.account.username});
                const account = {
                    email: context.account.email,
                    username: context.account.username,
                    token: token
                }
                setAccountCookie(context.res, account);
                return account;
            }
            return context.account;
        }
    },
    Mutation: {
        login: async (_source, { username, password }, { postgres, res, req }: { postgres: Pool, res: Response, req: Request }) => {
            const loginResponse = await login(postgres, username.toLowerCase(), password);
            setAccountCookie(res, loginResponse);
            return loginResponse;
        }
    }
}
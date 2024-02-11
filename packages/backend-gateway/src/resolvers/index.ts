import { Response } from "express";
import { encodeToken } from "../services/authorization";

export const resolvers = {
    Query: {
        me: (_source, { }, context) => {
            console.log(context.account);
            return context.account;
        }
    },
    Mutation: {
        login: (_source, { username, password }, { res, req }: { res: Response, req: Request }) => {
            if (username === 'redcartel' && password === 'password') {
                res.cookie('token', encodeToken({
                    username: 'redcartel',
                    email: 'carteradams@gmail.com'
                }));
                return {
                    username: 'redcartel',
                    email: 'carteradams@gmail.com'
                }
            }
            else {
                res.cookie('token', 'badlogin');
                return {
                    error: 'BADLOGIN'
                }
            }
        }
    }
}
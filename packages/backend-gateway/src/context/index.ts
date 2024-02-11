import { YogaInitialContext } from "graphql-yoga"
import { Pool } from "pg"
import jwt from "jsonwebtoken"
import { Request } from "express"
import { verifyToken } from "../services/authorization"

export type GatewayContext = YogaInitialContext

export function contextFactory(postgresConnection: Pool) {
    return async (context : any) => {
        const token : string = context.req.cookies.token || context.req.headers['authorization']?.slice(8) || '';
        if (token) {
            const account = verifyToken(token);
            if (account) {
                return {
                    ...context,
                    account,
                    postgres: postgresConnection
                };
            }
        }
        return { ...context, postgres: postgresConnection};
    }
}
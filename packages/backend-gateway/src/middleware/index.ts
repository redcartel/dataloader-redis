import { Plugin, YogaInitialContext } from "graphql-yoga";
import { verifyToken } from "../services/authorization";
import jwt from 'jsonwebtoken';
import { useExtendContext } from "graphql-yoga";

export const gatewayPlugins : Plugin[] = [
  // useExtendContext((ctx : any) => ({...ctx, account: {username: 'fake', email: 'fake@example.com'}}))
  {
    onRequestParse: (payload) => {
      payload.request.headers.append('authorization', 'Bearer x');
    }
  }
]
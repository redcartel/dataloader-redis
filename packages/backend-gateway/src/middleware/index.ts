import { Plugin, YogaInitialContext } from "graphql-yoga";
import { verifyToken } from "../services/authorization";
import jwt from 'jsonwebtoken';
import { useExtendContext } from "graphql-yoga";

export const gatewayPlugins : Plugin[] = []
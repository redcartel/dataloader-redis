import { YogaInitialContext } from "graphql-yoga";

export function getAccountFromContext(context: YogaInitialContext): {
  id?: string;
  username?: string;
  email?: string;
} {
  return JSON.parse(context.request.headers["x-account"] ?? "{}");
}

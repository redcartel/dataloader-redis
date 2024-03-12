import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import stringify from "json-stable-stringify";

/**
 *  HTTPExecutor that adds account from context as a JSON header in requests to subgraphs
 */
export function authExecutor(endpoint: string) {
  const executor = buildHTTPExecutor({
    endpoint: endpoint,
    headers: (execution) => {
      return {
        "x-account": `${stringify(execution?.context?.account ?? {})}`,
      };
    },
  });
  return executor;
}

import { RateLimiterRedis } from "rate-limiter-flexible";
import { Application } from "express";
import { errorHandler, middleware } from "supertokens-node/framework/express";
import cors from "cors";
import supertokens from "supertokens-node";
import morgan from "morgan";
import { redis } from "../server";
import { config } from "common-values";
import helmet from "helmet";
import compression from "compression";

function rateLimiterMiddleware(points: number) {
  const rateLimiter = new RateLimiterRedis({
    useRedisPackage: true,
    storeClient: redis,
    keyPrefix: "rateMiddleware",
    points: points,
    duration: 1,
  });

  return (req, res, next) => {
    rateLimiter
      .consume(req.ip)
      .then(() => {
        next();
      })
      .catch(() => {
        res.status(429).send("too many requests");
      });
  };
}

export function applyExpressMiddleware(app: Application) {
  app.use(morgan(config.isProd ? "short" : "dev"));
  if (config.isProd) app.use(rateLimiterMiddleware(10));
  if (config.isProd) app.use(helmet());
  app.use(
    cors({
      origin: "*", //config.gateway.corsOrigin as string,
      // allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
      credentials: true,
    }),
  );
  // app.options('/graphql', cors());
  app.use(middleware());
  app.use(errorHandler());
  app.use(compression());
}

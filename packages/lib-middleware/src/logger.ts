import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

export const logger = pino(
  isProd
    ? {
        level: process.env.LOG_LEVEL || "info",
        // In production, we emit raw JSON so it can be ingested by ELK/Datadog/etc.
        transport: undefined,
      }
    : {
        level: process.env.LOG_LEVEL || "debug",
        // In non‐prod, we pretty‐print to the console.
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            levelFirst: true,
            translateTime: "yyyy-mm-dd HH:MM:ss.l",
            ignore: "pid,hostname,incoming request,request completed",
          },
        },
      }
);
import 'dotenv/config'; 
import Fastify from "fastify";
import authRoutes from "./routes/auth";
import { middleware, logger as baseLogger }  from "@smartforms/lib-middleware";
import formsRoutes from './routes/forms';

const PORT = Number(process.env.PORT || 3002);
const API_KEY = process.env.API_KEY;

async function buildServer() {
  if (!API_KEY) {
    console.error("⚠️  Missing API_KEY in environment");
    process.exit(1);
  }

  const app = Fastify({ 
    logger: baseLogger,
  });

  app.register(middleware, {
    serviceName:    'backend-services',
    serviceVersion: '0.1.0',
    errorTypeBaseUrl: 'https://api.smartforms.com/errors'
  });

  // API-Key auth preHandler
  app.addHook("preHandler", async (request, reply) => {
    const key = request.headers["x-api-key"];
    if (key !== API_KEY) {
      reply
        .code(401)
        .send({ error: { code: "UNAUTHORIZED", message: "Invalid API key" } });
    }
  });

  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(formsRoutes, { prefix: '/forms/designer' });
  console.log('\n\t[server.ts->buildServer]->Registered routes:', app.printRoutes());
  return app;
}

(async () => {
  try {
    const app = await buildServer();
  await app.listen({ port: PORT, host: "0.0.0.0" })
    .then(() => app.log.info(`🚀 backend-services listening on ${PORT}`))
    .catch((err) => {
      app.log.error(err);
      process.exit(1);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

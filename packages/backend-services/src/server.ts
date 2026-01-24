import 'dotenv/config'; 
import Fastify from "fastify";
import fs from 'fs';
import path from 'path';
import { middleware, logger as baseLogger }  from "@smartforms/lib-middleware";
import { loadHolidays } from './utils/holidayFetcher';
import { verifyEmailConfiguration } from './services/emailService';
import pino from "pino";

const PORT = Number(process.env.PORT || 3002);
const API_KEY = process.env.API_KEY;
const routesDir = path.join(__dirname, 'routes');

const bootstrapHolidays = async () => {
  // Example: preload a few common countries for the current year
  const year = new Date().getFullYear();
  const countriesToPreload = ["US", "IN", "ZA", "AU", "GB"]; // you can add more
  for (const country of countriesToPreload) {
   try {
      await loadHolidays(country, year);
      baseLogger.info(`Preloaded holidays for ${country}/${year}`);
    } catch (err) {
      const errorMsg = (err instanceof Error) ? err.message : String(err);
      baseLogger.error(`Could not preload ${country}/${year}: ${errorMsg}`);
    }
  }
};

async function loadRoutesRecursively(app: any, dir: string, basePrefix: string = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fileName = entry.name;
    const fullPath = path.join(dir, fileName);
    
    if (entry.isDirectory()) {
      // Recursively load routes from subdirectories
      const newPrefix = basePrefix + '/' + fileName;
      await loadRoutesRecursively(app, fullPath, newPrefix);
    } else if (entry.isFile() && (fileName.endsWith('.js') || fileName.endsWith('.ts'))) {
      try {
        const mod = await import(fullPath);
        const plugin = mod.default || mod;
        
        const fileBaseName = path.basename(fileName, path.extname(fileName));// fileName.replace(/\.(js|ts)$/, '');
        const routePrefix = fileBaseName === 'index' 
          ? basePrefix || '/'
          : `${basePrefix}/${fileBaseName}`;
        
        await app.register(plugin, { prefix: routePrefix });
        console.log(`✅ Registered: ${routePrefix} <- ${dir}/${fileName}`);
      } catch (error) {
        console.error(`❌ Failed to register ${dir}/${fileName}:`, error);
      }
    }
  }
}

async function buildServer() {
  if (!API_KEY) {
    console.error("⚠️  Missing API_KEY in environment");
    process.exit(1);
  }

  const dest = pino.destination({ dest: 2, sync: false });

  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
      stream: dest,
    },
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

  // ---- Dynamic route loader for multiple folders ----
  await loadRoutesRecursively(app, routesDir)

  console.info('[server.ts->buildServer]->Registered routes:', app.printRoutes());
  return app;
}

(async () => {
  try {
    const app = await buildServer();
    await bootstrapHolidays(); // Preload holidays data
    await app.listen({ port: PORT, host: "0.0.0.0" })
    .then(() => app.log.info(`🚀 backend-services listening on ${PORT}`))
    .catch((err) => {
      app.log.error(err);
      process.exit(1);
    });

    // Then check email configuration asynchronously
    setTimeout(async () => {
      try {
        baseLogger.info('Checking email service configuration...');
        await verifyEmailConfiguration();
      } catch (error) {
        baseLogger.warn('Email service check failed, but server is running');
      }
    }, 5000); // Check after 5 seconds
  } catch (err) {
    baseLogger.error(err);
    process.exit(1);
  }
})();

import fp from 'fastify-plugin';
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { asyncLocalStorage, RequestContext } from './context';
import { APIError } from './errorHandler';
import { v4 as uuidv4 } from 'uuid';
import jwtDecode from 'jwt-decode';

interface PluginOptions {
  errorTypeBaseUrl?: string;
  serviceName?: string;
  serviceVersion?: string;
}

const plugin: FastifyPluginAsync<PluginOptions> = async (fastify, opts) => {
  const errorTypeBaseUrl = opts.errorTypeBaseUrl ?? 'https://api.smartforms.com/errors';
  const serviceName = opts.serviceName ?? process.env.SERVICE_NAME;
  const serviceVersion = opts.serviceVersion ?? process.env.SERVICE_VERSION;

  fastify.addHook('onRequest', (request, reply, done) => {
    const correlationId =
      (request.headers['x-correlation-id'] as string) || uuidv4();
    const apiKey = request.headers['x-api-key'] as string | undefined;
    const clientIp =
      (request.headers['x-forwarded-for'] as string) || request.ip;
    let user;
    const authHeader = request.headers['authorization'] as string | undefined;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const claims = jwtDecode<Record<string, any>>(token);
        user = {
          id: claims.sub,
          email: claims.email,
          org: claims.org, 
          exp: claims.exp,
        };
      } catch (_) {}
    }
    const startTime = process.hrtime();
    const context: RequestContext = {
      correlationId,
      apiKey,
      clientIp,
      user,
      startTime,
      method: request.method,
      url: request.url,
    };
    asyncLocalStorage.run(context, () => {
      request.headers['x-correlation-id'] = correlationId;
      done();
    });
  });

  fastify.addHook('onResponse', (request, reply, done) => {
    const ctx = asyncLocalStorage.getStore();
    if (ctx) {
      const [secs, nanos] = process.hrtime(ctx.startTime);
      const responseTimeMs = secs * 1000 + nanos / 1e6;
      request.log.info(
        {
          '@timestamp': new Date().toISOString(),
          'service.name': serviceName,
          'service.version': serviceVersion,
          'event.dataset': 'request',
          'log.level': 'info',
          correlation_id: ctx.correlationId,
          method: ctx.method,
          url: ctx.url,
          status_code: reply.statusCode,
          response_time_ms: responseTimeMs,
          client_ip: ctx.clientIp,
          api_key: ctx.apiKey,
          'user.id': ctx.user?.id,
          'user.email': ctx.user?.email,
          'user.org': ctx.user?.org,
          'user.exp': ctx.user?.exp,
        },
        'received request execution successfully completed'
      );
    }
    done();
  });

  fastify.setErrorHandler((error: Error, request: FastifyRequest, reply: FastifyReply) => {
    const ctx = asyncLocalStorage.getStore();
    const correlationId = ctx?.correlationId;
    const userId = ctx?.user?.id;
    const status = error instanceof APIError ? error.statusCode : 500;
    const code = error instanceof APIError ? error.code : 'INTERNAL_ERROR';
    const message = error.message || 'Internal Server Error';
    const path = request.url;
    const timestamp = new Date().toISOString();
    const problemDetails: Record<string, any> = {
      type: `${errorTypeBaseUrl}/${code}`,
      code,
      message,
      path,
      correlation_id: correlationId,
      user_id: userId,
      timestamp,
      status,
    };
    if (process.env.NODE_ENV !== 'production') {
      problemDetails.stack = error.stack;
    }
    request.log.error({ err: error, ...problemDetails }, 'received request failed to execute successfully');
    reply.status(status).send(problemDetails);
  });
};

export default fp(plugin, {
  name: '@smartforms/lib-middleware',
});

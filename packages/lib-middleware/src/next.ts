import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { asyncLocalStorage, RequestContext } from './context';
import { v4 as uuidv4 } from 'uuid';
import jwtDecode from 'jwt-decode';
import { APIError } from './errorHandler';

export function withMiddleware(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
    const apiKey = req.headers['x-api-key'] as string | undefined;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    let user: { id?: string; email?: string; org?: string; exp?: number } | undefined;
    const auth = req.headers.authorization as string | undefined;

    if (auth?.startsWith('Bearer ')) {
      try {
        const claims
        = jwtDecode<Record<string, any>>(auth.slice(7));
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
      method: req.method || 'GET',
      url: req.url || '',
    };
    res.setHeader('x-correlation-id', correlationId);

    return asyncLocalStorage.run(context, async () => {
      try {
        await handler(req, res);
        const [secs, nanos] = process.hrtime(startTime);
        const responseTimeMs = secs * 1000 + nanos / 1e6;
        console.info(JSON.stringify({
          '@timestamp': new Date().toISOString(),
          'service.name': process.env.SERVICE_NAME,
          'service.version': process.env.SERVICE_VERSION,
          'event.dataset': 'request',
          'log.level': 'info',
          correlation_id: correlationId,
          method: req.method,
          url: req.url,
          status_code: res.statusCode,
          response_time_ms: responseTimeMs,
          client_ip: clientIp,
          api_key: apiKey,
          user_id: user?.id,
          user_email: user?.email,
          user_org: user?.org,
          user_exp: user?.exp,
        }));
      } catch (error) {
        const err = error as Error;
        const status = err instanceof APIError ? err.statusCode : 500;
        const code = err instanceof APIError ? err.code : 'INTERNAL_ERROR';
        const message = err.message;
        const path = req.url;
        const timestamp = new Date().toISOString();
        const payload: Record<string, any> = {
          type: `https://api.smartforms.com/errors/${code}`,
          code,
          message,
          path,
          correlation_id: correlationId,
          user_id: user?.id,
          timestamp,
          status,
        };
        if (process.env.NODE_ENV !== 'production') {
          payload.stack = err.stack;
        }
        console.error(JSON.stringify(payload));
        res.status(status).json(payload);
      }
    });
  };
}

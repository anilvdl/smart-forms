import 'fastify';
import type { Session } from '../utils/auth';

declare module 'fastify' {
  interface FastifyRequest {
    /** Populated by our auth hook */
    session?: Session;
  }
}
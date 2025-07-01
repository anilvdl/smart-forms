import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { getSessionFromRequest } from '../../utils/auth';
import { listAuditLogsForOrg } from '@smartforms/lib-db/daos/audit/auditLogs.dao';

/**
 * Query parameters for listing audit logs
 */
interface AuditLogsQuery {
  page?: number;
  pageSize?: number;
  userId?: string;
  eventType?: string;
}

/**
 * Admin Audit Logs Route
 *
 * GET /admin/audit-logs
 *
 * Query Parameters:
 *  - page (number, default=1)
 *  - pageSize (number, default=20)
 *  - userId (optional filter)
 *  - eventType (optional filter)
 */
const adminAuditLogsRoute: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Authorization hook: only OWNER or ADMIN
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const session = await getSessionFromRequest(request);
      if (!session || !session.user || !session.user.activeAccountId) {
        return reply.status(401).send({ code: 'UNAUTHORIZED', message: 'Authentication required.' });
      }
      const role = session.user.role;
      if (role !== 'OWNER' && role !== 'ADMIN') {
        return reply.status(403).send({ code: 'FORBIDDEN', message: 'Admins only.' });
      }
      (request as any).session = session;
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Failed to verify session.' });
    }
  });

  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1 },
          pageSize: { type: 'integer', minimum: 1, maximum: 100 },
          userId: { type: 'string' },
          eventType: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: AuditLogsQuery }>, reply: FastifyReply) => {
    const session = (request as any).session;
    const orgId = session.user.activeAccountId;
    const { page = 1, pageSize = 20, userId, eventType } = request.query;

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    try {
      // Fetch logs from DAO
      const logs = await listAuditLogsForOrg(orgId, 
        {
            limit: pageSize,
            offset,
            userId,
            eventType
        });

      return reply.status(200).send({
        page,
        pageSize,
        logs
      });
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Failed to fetch audit logs.' });
    }
  });
};

export default adminAuditLogsRoute;
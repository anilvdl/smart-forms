import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { getSessionFromRequest } from '../../utils/auth';
import { listUsersInOrg } from '@smartforms/lib-db/daos/user/userOrgs.dao';

/**
 * Route definitions for Admin User & Role Management
 *
 * GET /admin/users - List all users for the current organization
 */
const adminUsersRoute: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Pre-handler hook: ensure user is OWNER or ADMIN
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
      // Attach session to request for handler
      (request as any).session = session;
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Failed to verify session.' });
    }
  });

  /**
   * GET /admin/users
   *
   * Returns a list of users belonging to the active organization.
   * Each item includes user metadata and their role/status in the org.
   */
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const session = (request as any).session;
    const orgId = session.user.activeAccountId;

    try {
      // Fetch all user-org mappings for the current org
      const userOrgs = await listUsersInOrg(orgId);

      // Transform to API response shape
      const result = userOrgs.map(uo => ({
        userId: uo.user_id,
        email: uo.email,
        name: uo.name,
        role: uo.role,
        isActive: uo.is_active,
        invitedAt: uo.created_at,
        joinedAt: uo.updated_at
      }));
      return reply.status(200).send(result);
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Failed to fetch users.' });
    }
  });
};

export default adminUsersRoute;

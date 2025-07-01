import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { getSessionFromRequest } from '../../utils/auth';
import { createInvite } from '@smartforms/lib-db/daos/invite/invites.dao';
import { sendInviteEmail } from '../../email/mailer';  

/**
 * Request body schema for creating a new invite
 */
interface InviteRequestBody {
  email: string;
  role: 'ADMIN' | 'DEVELOPER' | 'VIEWER';
}

/**
 * Plugin: Admin Invites Route
 *
 * - POST /admin/users/invite
 *   Creates an invitation for a new user in the organization.
 */
const adminInvitesRoute: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Pre-handler: authenticate and authorize (OWNER or ADMIN)
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
      // Attach session to request
      (request as any).session = session;
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Failed to verify session.' });
    }
  });

  /**
   * POST /admin/users/invite
   *
   * Body: { email, role }
   *
   * Creates an invite record and sends a magic-link email to the invitee.
   */
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'role'],
        properties: {
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['ADMIN', 'DEVELOPER', 'VIEWER'] }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, role } = request.body as InviteRequestBody;
    const session = (request as any).session;
    const orgId = session.user.activeAccountId;
    const invitedBy = session.user.id;
    const inviteId = uuidv4();
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    try {
      // Create invite record in DB
      await createInvite({
        id: inviteId,
        invitedEmail: email,
        orgId: orgId,
        invitedBy: invitedBy,
        roleRequested: role,
        token,
        expiresAt: expiresAt
      });

      // Send the invitation email with magic link
      await sendInviteEmail({
        to: email,
        inviteId,
        token,
        expiresAt,
        orgName: session.user.activeAccountName
      });

      return reply.status(201).send({
        inviteId,
        email,
        role,
        expiresAt
      });
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Failed to create and send invite.' });
    }
  });
};

export default adminInvitesRoute;

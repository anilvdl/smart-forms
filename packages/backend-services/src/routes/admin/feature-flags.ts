import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { getSessionFromRequest } from '../../utils/auth';
import { listFeatureFlags, updateFeatureFlag, FeatureFlag } from '@smartforms/lib-db/daos/feature/featureFlags.dao';

/**
 * Request body schema for updating a feature flag
 */
interface FeatureFlagUpdateBody {
  isEnabled?: boolean;
  minPlanRequired?: 'FREE' | 'PRO' | 'ENTERPRISE';
}

/**
 * Admin Feature Flags Route
 *
 * - GET  /admin/feature-flags    List all global feature flags
 * - PUT  /admin/feature-flags/:key   Update enabled state or minPlanRequired
 */
const adminFeatureFlagsRoute: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Authorization hook: only OWNER or ADMIN
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const session = await getSessionFromRequest(request);
      if (!session?.user?.activeAccountId) {
        return reply.status(401).send({ code: 'UNAUTHORIZED', message: 'Authentication required.' });
      }
      const role = session.user.role;
      if (role !== 'OWNER' && role !== 'ADMIN') {
        return reply.status(403).send({ code: 'FORBIDDEN', message: 'Admins only.' });
      }
      // attach session
      (request as any).session = session;
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Failed to verify session.' });
    }
  });

  /**
   * GET /admin/feature-flags
   *
   * Returns all global feature flags with their current enabled state and plan requirement.
   */
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const flags: FeatureFlag[] = await listFeatureFlags();
      return reply.status(200).send(flags);
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Failed to fetch feature flags.' });
    }
  });

  /**
   * PUT /admin/feature-flags/:key
   *
   * Body: { isEnabled?, minPlanRequired? }
   *
   * Update a feature flag's enabled state or minimum plan requirement.
   */
  fastify.put<{ Params: { key: string }; Body: FeatureFlagUpdateBody }>(
    '/:key',
    {
      schema: {
        params: {
          type: 'object',
          required: ['key'],
          properties: {
            key: { type: 'string' }
          }
        },
        body: {
          type: 'object',
          properties: {
            isEnabled: { type: 'boolean' },
            minPlanRequired: { type: 'string', enum: ['FREE','PRO','ENTERPRISE'] }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Params: { key: string }; Body: FeatureFlagUpdateBody }>, reply: FastifyReply) => {
      const { key } = request.params;
      const { isEnabled, minPlanRequired } = request.body;

      // Must provide at least one updatable field
      if (isEnabled === undefined && minPlanRequired === undefined) {
        return reply.status(400).send({ code: 'INVALID_REQUEST', message: 'No fields to update.' });
      }

      try {
        const updated: FeatureFlag | null = await updateFeatureFlag({flagKey: key, isEnabled, minPlanRequired });
        if (!updated) {
          return reply.status(404).send({ code: 'NOT_FOUND', message: 'Feature flag not found.' });
        }
        return reply.status(200).send(updated);
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Failed to update feature flag.' });
      }
    }
  );
};

export default adminFeatureFlagsRoute;

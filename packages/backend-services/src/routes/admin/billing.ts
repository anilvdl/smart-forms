import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { getSessionFromRequest } from '../../utils/auth';
import * as orgAccountDao from '@smartforms/lib-db/daos/org/orgAccounts.dao';
import { APIError, logger as dbLogger, toError } from '@smartforms/lib-middleware';
import * as auditLogDao from '@smartforms/lib-db/daos/audit/auditLogs.dao';
import { v4 as uuid } from 'uuid';

interface UpdateBillingPlanBody {
  organizationId: string;
  billingPlan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' | 'STARTER-PAYU' | 'PRO-PAYU' | 'ENTERPRISE-PAYU';
}

/**
 * Admin Billing Route
 *
 * - GET  /admin/billing         Fetch current org billing info
 * - POST /admin/billing/change-plan   Change subscription plan
 * - POST /admin/billing/update-card   Generate payment method intent
 * - POST /admin/billing/update-plan   Updates the billing plan for an organization or user
 */
const adminBillingRoute: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Authorization hook: ensure OWNER or ADMIN
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    
    try {
      console.log('Admin Billing Route - preHandler. Headers:', request.headers);
      const session = await getSessionFromRequest(request);
      if (!session?.user?.activeAccountId) {
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

  /**
   * GET /admin/billing
   *
   * Returns billing information for the current organization.
   */
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const session = (request as any).session;
    const orgId = session.user.activeAccountId;

    try {
      const org = await orgAccountDao.getOrgAccount(orgId);
      if (!org) {
        return reply.status(404).send({ code: 'NOT_FOUND', message: 'Organization not found.' });
      }
      // Respond with relevant billing fields
      return reply.status(200).send({
        billingPlan: org.billing_plan,
        billingStatus: org.billing_status,
        nextBillingDate: org.next_billing_date,
        provider: org.provider,
        subscriptionId: org.subscription_id,
        preferredCurrency: org.preferred_currency
      });
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Failed to fetch billing info.' });
    }
  });

  /**
   * POST /admin/billing/change-plan
   *
   * Body: { newPlan }
   *
   * Updates the subscription plan via Stripe and syncs the DB.
   */
  fastify.post<{ Body: { newPlan: 'FREE' | 'PRO' | 'ENTERPRISE' } }>(
    '/change-plan',
    {
      schema: {
        body: {
          type: 'object',
          required: ['newPlan'],
          properties: {
            newPlan: { type: 'string', enum: ['FREE','PRO','ENTERPRISE'] }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: { newPlan: 'FREE' | 'PRO' | 'ENTERPRISE' } }>, reply: FastifyReply) => {
      const session = (request as any).session;
      const orgId = session.user.activeAccountId;
      const { newPlan } = request.body;

      try {
        // Call Stripe to change subscription and update DB record
        const updatedOrg = await orgAccountDao.updateOrgBillingPlan(orgId, newPlan);
        return reply.status(200).send({
          billingPlan: updatedOrg.billing_plan,
          nextBillingDate: updatedOrg.next_billing_date
        });
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Failed to change plan.' });
      }
    }
  );

  /**
   * POST /admin/billing/update-card
   *
   * Generates a SetupIntent client secret for updating payment method.
   */
  fastify.post('/update-card', async (request: FastifyRequest, reply: FastifyReply) => {
    const session = (request as any).session;
    const orgId = session.user.activeAccountId;

    try {
      const { clientSecret } = await orgAccountDao.createBillingSetupIntent(orgId);
      return reply.status(200).send({ clientSecret });
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Failed to generate setup intent.' });
    }
  });

  // Update billing plan after user selection in onboarding
  fastify.post('/update-plan', async (request, reply) => {
    const session = (request as any).session;
    const userId = session.user.id;

    console.log('Updating billing plan for user:', userId);
    
    if (!userId) {
      throw new APIError('UNAUTHORIZED', 'User not authenticated', 401);
    }

    const { organizationId, billingPlan } = request.body as UpdateBillingPlanBody;

    if (!organizationId || !billingPlan) {
      throw new APIError('INVALID_REQUEST', 'Organization ID and billing plan are required', 400);
    }

    // Validate that the user has access to this organization
    const userOrg = await orgAccountDao.getUserOrgRole(userId, organizationId);
    if (!userOrg || (userOrg.role !== 'OWNER' && userOrg.role !== 'ADMIN')) {
      throw new APIError('FORBIDDEN', 'You do not have permission to update billing for this organization', 403);
    }

    try {
      // Update the billing plan from PENDING to selected plan
      const updatedOrg = await orgAccountDao.updateBillingPlan(organizationId, {
        billing_plan: billingPlan,
        billing_status: 'ACTIVE',
        updated_at: new Date()
      });

      // Log the billing plan update
      await auditLogDao.createAuditLog({
        id: uuid(),
        orgId: organizationId,
        userId: userId,
        eventType: 'BILLING_PLAN_SELECTED',
        metadata: {
          previous_plan: 'PENDING',
          new_plan: billingPlan,
          timestamp: new Date().toISOString()
        }
      });

      // For paid plans, we'll need to create a Stripe checkout session
      // This will be handled separately in the billing setup step
      const requiresPayment = !billingPlan.includes('FREE');

      reply.code(200).send({
        success: true,
        organization: {
          id: updatedOrg.id,
          billing_plan: updatedOrg.billing_plan,
          billing_status: updatedOrg.billing_status
        },
        requiresPayment,
        message: `Successfully updated to ${billingPlan} plan`
      });
    } catch (error) {
      const e = toError(error);
      dbLogger.error({err: e}, 'Error updating billing plan.');
      throw new APIError('INTERNAL_ERROR', 'Failed to update billing plan' , 500, e.message);
    }
  });

  // Get current billing status for an organization
  fastify.get('/status/:orgId', async (request, reply) => {
    const session = (request as any).session;
    const userId = session.user.id;
    const { orgId } = request.params as { orgId: string };

    if (!userId) {
      throw new APIError('UNAUTHORIZED', 'User not authenticated', 401);
    }

    // Validate user has access to this organization
    const userOrg = await orgAccountDao.getUserOrgRole(userId, orgId);
    if (!userOrg) {
      throw new APIError('FORBIDDEN', 'You do not have access to this organization', 403);
    }

    const org = await orgAccountDao.getById(orgId);
    if (!org) {
      throw new APIError('NOT_FOUND', 'Organization not found', 404);
    }

    reply.send({
      organizationId: org.id,
      billingPlan: org.billing_plan,
      billingStatus: org.billing_status,
      customerId: org.billing_customer_id,
      subscriptionId: org.subscription_id,
      nextBillingDate: org.next_billing_date
    });
  });
};

export default adminBillingRoute;
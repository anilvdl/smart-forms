import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { getSessionFromRequest } from '../../utils/auth';
import * as userOrgsDao from '@smartforms/lib-db/daos/user/userOrgs.dao';
import * as prefsDao    from '@smartforms/lib-db/daos/userPreferences/userPreferences.dao';
import * as orgAccountsDao from "@smartforms/lib-db/daos/org/orgAccounts.dao";


export interface UserOrgsResponse {
  defaultOrgId?: string;
  orgs: Array<{
    orgId: string;
    role: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'REVIEWER' | 'VIEWER';
  }>;
}

const userOrgsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // preHandler: only authenticated users
  fastify.addHook('preHandler', async (request, reply) => {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return reply.status(401).send({ code: 'UNAUTHORIZED', message: 'Not logged in' });
    }
     (request as any).session = session;
  });

  // GET /admin/user-orgs
  fastify.get('/', async (request, reply) => {
    const session = (request as any).session;
    const userId = session.user.id;

    try {
      // 1) fetch all active memberships
      const memberships = await userOrgsDao.listUserOrgsByUserId(userId);
      // 2) fetch user preferences (to get defaultOrgId)
      const prefs = await prefsDao.getUserPreferences(userId);

      const result: UserOrgsResponse = {
        defaultOrgId: prefs?.defaultOrgId ?? undefined,
        orgs: memberships.map(m => ({
          orgId: m.org_id,
          role: m.role as any,
        })),
      };
      return reply.send(result);
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({ code: 'INTERNAL_ERROR', message: err.message });
    }
  });

  // POST /admin/user-orgs
  fastify.post<{ Body: { orgId: string }}>('/', async (request, reply) => {
    const session = (request as any).session;
    const userId = session.user.id;
    const { orgId } = request.body;
    if (!orgId) {
      return reply.status(400).send({ code: 'BAD_REQUEST', message: 'orgId is required' } as any);
    }

    try {
      // upsert default in prefs
      await prefsDao.upsertUserPreferences({ userId, defaultOrgId: orgId });
      return reply.send({ success: true });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({ code: 'INTERNAL_ERROR', message: err.message });
    }
  });

  fastify.get<{ Params: { userId: string } }>(
    "/:userId/billing-status",
    async (req, reply) => {
      const { userId } = req.params;
      // const orgAccountsDao = new OrgAccountsDao();
      // const userOrgsDao = new UserOrgsDao();
      
      try {
        // Get user's organizations using DAO
        const userOrgs = await userOrgsDao.findByUserId(userId);
        
        if (!userOrgs || userOrgs.length === 0) {
          return reply.send({
            hasBillingPlan: false,
            needsOnboarding: true
          });
        }
        
        // Get the primary organization (owner role or first one)
        const primaryUserOrg = userOrgs.find(uo => uo.role === 'OWNER') || userOrgs[0];
        
        // Get organization details using DAO
        const org = await orgAccountsDao.findById(primaryUserOrg.org_id);
        
        if (!org) {
          return reply.send({
            hasBillingPlan: false,
            needsOnboarding: true
          });
        }
        
        // User needs onboarding if they're on FREE plan without explicit selection
        // We can check this by seeing if they have completed any billing setup
        const needsOnboarding = org.billing_plan === 'FREE' && 
                              !org.billing_customer_id && 
                              !org.subscription_id;
        
        reply.send({
          hasBillingPlan: true,
          needsOnboarding: needsOnboarding,
          plan: org.billing_plan,
          status: org.billing_status
        });
        
      } catch (error) {
        req.log.error(error);
        reply.status(500).send({ 
          error: { 
            code: "FETCH_FAILED", 
            message: "Could not fetch billing status" 
          } 
        });
      }
    }
  );
};

export default userOrgsRoutes;
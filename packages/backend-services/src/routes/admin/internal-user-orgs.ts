import { FastifyInstance, FastifyPluginAsync } from "fastify";
import * as userOrgsDao from "@smartforms/lib-db/daos/user/userOrgs.dao";
import * as prefsDao   from "@smartforms/lib-db/daos/userPreferences/userPreferences.dao";
import * as orgAccountsDao from "@smartforms/lib-db/daos/org/orgAccounts.dao";

const INTERNAL_PREFIX = "/admin/internal";
const API_KEY = process.env.API_KEY!;

const internalUserOrgs: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Only check API key header
  fastify.addHook("onRequest", async (req, reply) => {
    if (req.headers["x-api-key"] !== API_KEY) {
      return reply.code(401).send({ error: "Invalid API key" });
    }
  });

  // GET /admin/internal/user-orgs/:userId
  fastify.get(`/:userId`, async (req, reply) => {
    const userId = (req.params as any).userId as string;

    try {
      // 1) list all active orgs
      const memberships = await userOrgsDao.listUserOrgsByUserId(userId);
      // 2) fetch default from preferences
      const prefs = await prefsDao.getUserPreferences(userId);
    
      const result = {
        defaultOrgId: prefs?.defaultOrgId,
        orgs: memberships.map((m) => ({
          orgId: m.org_id,
          role: m.role as "OWNER" | "ADMIN" | "DEVELOPER" | "VIEWER",
        })),
      };

      return reply.send(result);
    } catch (err: any) {
      req.log.error(err);
      return reply.code(500).send({ error: "INTERNAL_ERROR", message: err.message });
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
          // const needsOnboarding = org.billing_plan === 'FREE' && 
          //                       !org.billing_customer_id && 
          //                       !org.subscription_id;
           const needsOnboarding = org.billing_plan === 'PENDING' && 
                                !org.billing_customer_id && 
                                !org.subscription_id;

          // Alternatively, we can check if billing_plan is null or empty
          // This indicates they haven't set up billing yet
          // const needsOnboarding = !!org.billing_plan;
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

export default internalUserOrgs;
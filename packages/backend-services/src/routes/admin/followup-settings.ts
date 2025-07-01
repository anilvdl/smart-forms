import { FastifyInstance, FastifyPluginAsync, FastifySchema } from 'fastify';
import { getSessionFromRequest, Session } from '../../utils/auth';
import * as settingsDao from '@smartforms/lib-db/daos/followup/settings.dao';

interface FollowupBody {
  enabled: boolean;
  distributionGroupId?: string;
  adHocEmails?: string[];
  intervalDays?: number;
  skipWeekends: boolean;
  sendFinalReminder: boolean;
  templateSubject?: string;
  templateBody?: string;
}

const followupSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['enabled','skipWeekends','sendFinalReminder'],
    properties: {
      enabled: { type: 'boolean' },
      distributionGroupId: { type: ['string','null'], format: 'uuid' },
      adHocEmails: {
        type: ['array','null'],
        items: { type: 'string', format: 'email' },
      },
      intervalDays: { type: ['integer','null'], minimum: 1 },
      skipWeekends: { type: 'boolean' },
      sendFinalReminder: { type: 'boolean' },
      templateSubject: { type: ['string','null'] },
      templateBody: { type: ['string','null'] },
    },
    additionalProperties: false,
  },
};

const followupRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Auth hook
  fastify.addHook('preHandler', async (request, reply) => {
    const session = await getSessionFromRequest(request);
    if (!session || !['OWNER','ADMIN'].includes(session.user.role)) {
      return reply.status(403).send({ code: 'FORBIDDEN', message: 'Admins only.' });
    }
    // TS7053 fix: cast request to allow .session
    (request as any).session = session as Session;
  });

  // GET settings
  fastify.get<{
    Params: { formId: string };
  }>('/forms/:formId/followup', {
    schema: {
      params: { type: 'object', required: ['formId'], properties: { formId: { type: 'string', format: 'uuid' } } },
    },
    handler: async (request, reply) => {
      const { formId } = request.params;
      try {
        const settings = await settingsDao.getSettings(formId);
        if (!settings) {
          return reply.status(404).send({ code: 'NOT_FOUND', message: 'No settings found.' });
        }
        reply.send(settings);
      } catch (err: any) {
        request.log.error(err);
        reply.status(500).send({ code: 'INTERNAL_ERROR', message: err.message });
      }
    },
  });

  // POST / upsert settings
  fastify.post<{
    Params: { formId: string };
    Body: FollowupBody;
  }>('/forms/:formId/followup', {
    schema: {
      params: { type: 'object', required: ['formId'], properties: { formId: { type: 'string', format: 'uuid' } } },
      ...followupSchema,
    },
    handler: async (request, reply) => {
      const { formId } = request.params;
      const body = request.body as FollowupBody;
      try {
        const settings = await settingsDao.upsertSettings({
          formId,
          enabled: body.enabled,
          distributionGroupId: body.distributionGroupId || null,
          adHocEmails: body.adHocEmails || null,
          intervalDays: body.intervalDays || null,
          skipWeekends: body.skipWeekends,
          sendFinalReminder: body.sendFinalReminder,
          templateSubject: body.templateSubject || null,
          templateBody: body.templateBody || null,
        });
        reply.send(settings);
      } catch (err: any) {
        request.log.error(err);
        reply.status(500).send({ code: 'INTERNAL_ERROR', message: err.message });
      }
    },
  });

  // DELETE settings
  fastify.delete<{
    Params: { formId: string };
  }>('/forms/:formId/followup', {
    schema: {
      params: { type: 'object', required: ['formId'], properties: { formId: { type: 'string', format: 'uuid' } } },
    },
    handler: async (request, reply) => {
      const { formId } = request.params;
      try {
        await settingsDao.deleteSettings(formId);
        reply.send({ success: true });
      } catch (err: any) {
        request.log.error(err);
        reply.status(500).send({ code: 'INTERNAL_ERROR', message: err.message });
      }
    },
  });
};

export default followupRoutes;
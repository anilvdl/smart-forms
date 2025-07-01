import { FastifyInstance, FastifyPluginAsync, FastifySchema } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { getSessionFromRequest, Session } from '../../utils/auth';
import * as groupsDao from '@smartforms/lib-db/daos/distribution/distributionGroups.dao';
import * as membersDao from '@smartforms/lib-db/daos/distribution/distributionGroupMembers.dao';

interface DistributionGroupBody {
  orgId: string;
  name: string;
}

interface UpdateGroupBody {
  name: string;
}

interface AddMemberBody {
  email: string;
}

const groupSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['orgId', 'name'],
    properties: {
      orgId: { type: 'string', format: 'uuid' },
      name: { type: 'string', minLength: 1 },
    },
    additionalProperties: false,
  },
};

const updateGroupSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1 },
    },
    additionalProperties: false,
  },
};

const addMemberSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' },
    },
    additionalProperties: false,
  },
};

const distributionGroupsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Pre-handler: authenticate & authorize
  fastify.addHook('preHandler', async (request, reply) => {
    const session = await getSessionFromRequest(request);
    if (!session || !['OWNER','ADMIN'].includes(session.user.role)) {
      return reply.status(403).send({ code: 'FORBIDDEN', message: 'Admins only.' });
    }
    // TS7053 fix: cast request to allow .session
    (request as any).session = session as Session;
  });

  // List groups for an org
  fastify.get<{
    Querystring: { orgId: string };
  }>('/', {
    schema: {
      querystring: {
        type: 'object',
        required: ['orgId'],
        properties: { orgId: { type: 'string', format: 'uuid' } },
        additionalProperties: false,
      },
    },
    handler: async (request, reply) => {
      const { orgId } = request.query;
      try {
        const groups = await groupsDao.listDistributionGroupsForOrg(orgId);
        reply.send(groups);
      } catch (err: any) {
        request.log.error(err);
        reply.status(500).send({ code: 'INTERNAL_ERROR', message: err.message });
      }
    },
  });

  // Create a new group
  fastify.post<{
    Body: DistributionGroupBody;
  }>('/', {
    schema: groupSchema,
    handler: async (request, reply) => {
      const { orgId, name } = request.body;
      try {
        const group = await groupsDao.createDistributionGroup({ id: uuidv4(), orgId, name });
        reply.code(201).send(group);
      } catch (err: any) {
        request.log.error(err);
        reply.status(500).send({ code: 'INTERNAL_ERROR', message: err.message });
      }
    },
  });

  // Rename an existing group
  fastify.put<{
    Params: { id: string };
    Body: UpdateGroupBody;
  }>('/:id', {
    schema: {
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      ...updateGroupSchema,
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      const { name } = request.body;
      try {
        const group = await groupsDao.updateDistributionGroup({ groupId: id, name });
        reply.send(group);
      } catch (err: any) {
        request.log.error(err);
        reply.status(500).send({ code: 'INTERNAL_ERROR', message: err.message });
      }
    },
  });

  // Delete a group
  fastify.delete<{
    Params: { id: string };
  }>('/:id', {
    schema: {
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      try {
        await groupsDao.deleteDistributionGroup(id);
        reply.send({ success: true });
      } catch (err: any) {
        request.log.error(err);
        reply.status(500).send({ code: 'INTERNAL_ERROR', message: err.message });
      }
    },
  });

  // List members of a group
  fastify.get<{
    Params: { id: string };
  }>('/:id/members', {
    schema: {
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      try {
        const members = await membersDao.listMembersOfGroup(id);
        reply.send(members);
      } catch (err: any) {
        request.log.error(err);
        reply.status(500).send({ code: 'INTERNAL_ERROR', message: err.message });
      }
    },
  });

  // Add a member
  fastify.post<{
    Params: { id: string };
    Body: AddMemberBody;
  }>('/:id/members', {
    schema: {
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      ...addMemberSchema,
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      const { email } = request.body;
      try {
        const member = await membersDao.addMemberToGroup({ groupId: id, email });
        reply.code(201).send(member);
      } catch (err: any) {
        request.log.error(err);
        reply.status(500).send({ code: 'INTERNAL_ERROR', message: err.message });
      }
    },
  });

  // Remove a member
  fastify.delete<{
    Params: { id: string; email: string };
  }>('/:id/members/:email', {
    schema: {
      params: {
        type: 'object',
        required: ['id','email'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' }
        }
      }
    },
    handler: async (request, reply) => {
      const { id, email } = request.params;
      try {
        await membersDao.removeMemberFromGroup({groupId: id, email});
        reply.send({ success: true });
      } catch (err: any) {
        request.log.error(err);
        reply.status(500).send({ code: 'INTERNAL_ERROR', message: err.message });
      }
    },
  });
};

export default distributionGroupsRoutes;
import { FastifyPluginAsync } from 'fastify';
import { APIError, logger as dbLogger, toError } from '@smartforms/lib-middleware';
import { TemplateDAO } from '@smartforms/lib-db/daos/template/template.dao';
import { FormRawDAO } from '@smartforms/lib-db/daos/formRaw.dao';
import { UserDAO } from '@smartforms/lib-db/daos/users.dao';
import { getRequestContext } from '@smartforms/lib-middleware';
import { v4 as uuidv4 } from 'uuid';

interface TemplateSearchQuery {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

interface CloneTemplateBody {
  templateId: string;
  title?: string;
}

interface FavoriteTemplateBody {
  templateId: string;
}

const templateRoutes: FastifyPluginAsync = async (fastify) => {
  const templateDao = new TemplateDAO(dbLogger);
  const formRawDao = new FormRawDAO(dbLogger);
  const userDao = UserDAO;

  // Get all templates with optional filtering
  fastify.get('/', async (request, reply) => {
    const { category, search, limit = 50, offset = 0 } = request.query as TemplateSearchQuery;
    
    console.log('Fetching templates with params:', { category, search, limit, offset });

    try {
      const templates = await templateDao.searchTemplates({
        category,
        search,
        limit: Number(limit),
        offset: Number(offset)
      });

      // Get user's favorites if authenticated
      const ctx = getRequestContext();
      let userFavorites: string[] = [];
      
      if (ctx?.user?.email) {
        const user = await userDao.getUserByEmail(ctx.user.email);
        if (user) {
          userFavorites = await templateDao.getUserFavorites(user.id);
        }
      }

      // Mark favorites in response
      const templatesWithFavorites = templates.map((template: any) => ({
        ...template,
        isFavorite: userFavorites.includes(template.id)
      }));

      reply.send({
        templates: templatesWithFavorites,
        total: await templateDao.countTemplates({ category, search })
      });
    } catch (error) {
      const e = toError(error);
      dbLogger.error({err: e}, 'Error fetching templates:');
      throw new APIError('INTERNAL_ERROR', 'Failed to fetch templates', 500, e.message);
    }
  });

  // Get template categories
  fastify.get('/categories', async (request, reply) => {
    try {
      const categories = await templateDao.getCategories();
      reply.send(categories);
    } catch (error) {
      const e = toError(error);
      dbLogger.error({err: e},'Error fetching categories:');
      throw new APIError('INTERNAL_ERROR', 'Failed to fetch categories', 500, e.message);
    }
  });

  // Clone template to user's forms
  fastify.post('/clone', async (request, reply) => {
    const ctx = getRequestContext();
    if (!ctx?.user?.email) {
      throw new APIError('UNAUTHORIZED', 'User not authenticated', 401);
    }

    const { templateId, title } = request.body as CloneTemplateBody;
    
    if (!templateId) {
      throw new APIError('INVALID_REQUEST', 'Template ID is required', 400);
    }

    try {
      // Get user
      const user = await userDao.getUserByEmail(ctx.user.email);
      if (!user) {
        throw new APIError('USER_NOT_FOUND', 'User not found', 404);
      }

      // Get template
      const template = await templateDao.getById(templateId);
      if (!template) {
        throw new APIError('NOT_FOUND', 'Template not found', 404);
      }

      // Create new form from template
      const formId = uuidv4();
      const formTitle = title || template.title;
      
      const draft = await formRawDao.createDraft({
        formId,
        userId: user.id,
        title: formTitle,
        rawJson: template.raw_json,
        version: 1,
        thumbnail: template.thumbnail
      });

      // Track template usage
      await templateDao.trackUsage(templateId, user.id, ctx.user.org);

      reply.code(201).send({
        formId: draft.form_id,
        title: formTitle,
        version: draft.version,
        status: draft.status,
        message: 'Template cloned successfully'
      });
    } catch (error) {
      const e = toError(error);
      dbLogger.error({err: e},'Error cloning template:');
      throw new APIError('INTERNAL_ERROR', 'Failed to clone template', 500, e.message);
    }
  });

  // Add template to favorites
  fastify.post('/favorites', async (request, reply) => {
    const ctx = getRequestContext();
    if (!ctx?.user?.email) {
      throw new APIError('UNAUTHORIZED', 'User not authenticated', 401);
    }

    const { templateId } = request.body as FavoriteTemplateBody;
    
    if (!templateId) {
      throw new APIError('INVALID_REQUEST', 'Template ID is required', 400);
    }

    try {
      const user = await userDao.getUserByEmail(ctx.user.email);
      if (!user) {
        throw new APIError('USER_NOT_FOUND', 'User not found', 404);
      }

      await templateDao.addToFavorites(user.id, templateId);
      
      reply.send({
        success: true,
        message: 'Template added to favorites'
      });
    } catch (error) {
      const e = toError(error);
      dbLogger.error({err: e},'Error adding to favorites:');
      throw new APIError('INTERNAL_ERROR', 'Failed to add to favorites', 500, e.message);
    }
  });

  // Remove template from favorites
  fastify.delete('/favorites/:templateId', async (request, reply) => {
    const ctx = getRequestContext();
    if (!ctx?.user?.email) {
      throw new APIError('UNAUTHORIZED', 'User not authenticated', 401);
    }

    const { templateId } = request.params as { templateId: string };

    try {
      const user = await userDao.getUserByEmail(ctx.user.email);
      if (!user) {
        throw new APIError('USER_NOT_FOUND', 'User not found', 404);
      }

      await templateDao.removeFromFavorites(user.id, templateId);
      
      reply.send({
        success: true,
        message: 'Template removed from favorites'
      });
    } catch (error) {
      const e = toError(error);
      dbLogger.error({err: e},'Error removing from favorites:');
      throw new APIError('INTERNAL_ERROR', 'Failed to remove from favorites', 500, e.message);
    }
  });

  // Get user's favorite templates
  fastify.get('/favorites', async (request, reply) => {
    console.log("calling /api/templates/favorites -> GET");
    const ctx = getRequestContext();
    console.log(`ctx?.user?.email: ${ctx?.user?.email}`);
    if (!ctx?.user?.email) {
      throw new APIError('UNAUTHORIZED', 'User not authenticated', 401);
    }

    try {
      const user = await userDao.getUserByEmail(ctx.user.email);
      if (!user) {
        console.log('user not found for email: ', ctx.user.email);
        throw new APIError('USER_NOT_FOUND', 'User not found', 404);
      }

      const favorites = await templateDao.getUserFavoriteTemplates(user.id);
      console.log(`data returned: ${favorites}`);
      reply.send({
        templates: favorites,
        total: favorites.length
      });
    } catch (error) {
      const e = toError(error);
      dbLogger.error({err: e},'Error fetching favorites:');
      throw new APIError('INTERNAL_ERROR', 'Failed to fetch favorites', 500, e.message);
    }
  });

  // Get popular templates
  fastify.get('/popular', async (request, reply) => {
    const { limit = 10 } = request.query as { limit?: number };

    try {
      const popularTemplates = await templateDao.getPopularTemplates(Number(limit));
      reply.send(popularTemplates);
    } catch (error) {
      const e = toError(error);
      dbLogger.error({err: e},'Error fetching popular templates:');
      throw new APIError('INTERNAL_ERROR', 'Failed to fetch popular templates', 500, e.message);
    }
  });
};

export default templateRoutes;
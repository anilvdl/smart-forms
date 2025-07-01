import { DBLogger } from '../../config';
import pool from '../../index';
import { v4 as uuidv4 } from 'uuid';

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  sub_category: string;
  raw_json: any;
  thumbnail: string;
  is_active: boolean;
  display_order: number;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface TemplateSearchParams {
  category?: string;
  search?: string;
  limit: number;
  offset: number;
}

export class TemplateDAO {
  private logger: DBLogger;

  constructor(logger: DBLogger) {
    this.logger = logger;
  }

  async searchTemplates(params: TemplateSearchParams): Promise<Partial<Template>[]> {
    let query = `
      SELECT 
        id, title, description, category, sub_category,
        thumbnail, tags, display_order
      FROM smartform.sf_form_templates
      WHERE is_active = true
    `;
    
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (params.category) {
      query += ` AND category = $${paramIndex}`;
      queryParams.push(params.category);
      paramIndex++;
    }

    if (params.search) {
      query += ` AND (
        title ILIKE $${paramIndex} OR 
        description ILIKE $${paramIndex} OR 
        $${paramIndex} = ANY(tags)
      )`;
      queryParams.push(`%${params.search}%`);
      paramIndex++;
    }

    query += ` ORDER BY display_order ASC, title ASC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(params.limit, params.offset);

    try {
      const result = await pool.query(query, queryParams);
      return result.rows;
    } catch (error) {
      this.logger.error('Error searching templates:', String(error));
      throw error;
    }
  }

  async countTemplates(params: { category?: string; search?: string }): Promise<number> {
    let query = `
      SELECT COUNT(*) as total
      FROM smartform.sf_form_templates
      WHERE is_active = true
    `;
    
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (params.category) {
      query += ` AND category = $${paramIndex}`;
      queryParams.push(params.category);
      paramIndex++;
    }

    if (params.search) {
      query += ` AND (
        title ILIKE $${paramIndex} OR 
        description ILIKE $${paramIndex} OR 
        $${paramIndex} = ANY(tags)
      )`;
      queryParams.push(`%${params.search}%`);
    }

    try {
      const result = await pool.query(query, queryParams);
      return parseInt(result.rows[0].total);
    } catch (error) {
      this.logger.error('Error counting templates:', String(error));
      throw error;
    }
  }

  async getById(templateId: string): Promise<Template | null> {
    const query = `
      SELECT * FROM smartform.sf_form_templates
      WHERE id = $1 AND is_active = true
    `;
    
    try {
      const result = await pool.query(query, [templateId]);
      return result.rows[0] || null;
    } catch (error) {
      this.logger.error('Error getting template by ID:', String(error));
      throw error;
    }
  }

  async getCategories(): Promise<Array<{ category: string; template_count: number }>> {
    const query = `
      SELECT DISTINCT 
        category,
        COUNT(*) as template_count
      FROM smartform.sf_form_templates
      WHERE is_active = true
      GROUP BY category
      ORDER BY category
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      this.logger.error('Error getting categories:', String(error));
      throw error;
    }
  }

  async addToFavorites(userId: string, templateId: string): Promise<void> {
    const query = `
      INSERT INTO smartform.sf_user_favorite_templates (user_id, template_id, added_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id, template_id) DO NOTHING
    `;
    
    try {
      await pool.query(query, [userId, templateId]);
    } catch (error) {
      this.logger.error('Error adding to favorites:', String(error));
      throw error;
    }
  }

  async removeFromFavorites(userId: string, templateId: string): Promise<void> {
    const query = `
      DELETE FROM smartform.sf_user_favorite_templates
      WHERE user_id = $1 AND template_id = $2
    `;
    
    try {
      await pool.query(query, [userId, templateId]);
    } catch (error) {
      this.logger.error('Error removing from favorites:', String(error));
      throw error;
    }
  }

  async getUserFavorites(userId: string): Promise<string[]> {
    const query = `
      SELECT template_id 
      FROM smartform.sf_user_favorite_templates
      WHERE user_id = $1
      ORDER BY added_at DESC
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => row.template_id);
    } catch (error) {
      this.logger.error('Error getting user favorites:', String(error));
      throw error;
    }
  }

  async getUserFavoriteTemplates(userId: string): Promise<Array<Partial<Template> & { added_at: Date }>> {
    const query = `
      SELECT 
        t.id, t.title, t.description, t.category, t.sub_category,
        t.thumbnail, t.tags, t.display_order,
        f.added_at
      FROM smartform.sf_form_templates t
      INNER JOIN smartform.sf_user_favorite_templates f ON t.id = f.template_id
      WHERE f.user_id = $1 AND t.is_active = true
      ORDER BY f.added_at DESC
    `;
    
    console.log(`getUserFavoriteTemplates -> Executiing Query : ${query} and params : ${userId}`);
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      this.logger.error('Error getting user favorite templates:', String(error));
      throw error;
    }
  }

  async trackUsage(templateId: string, userId: string, orgId?: string): Promise<void> {
    const query = `
      INSERT INTO smartform.sf_template_usage (id, template_id, user_id, org_id, used_at)
      VALUES ($1, $2, $3, $4, NOW())
    `;
    
    try {
      await pool.query(query, [uuidv4(), templateId, userId, orgId]);
    } catch (error) {
      this.logger.error('Error tracking template usage:', String(error));
      throw error;
    }
  }

  async getPopularTemplates(limit: number): Promise<Array<Partial<Template> & { usage_count: number }>> {
    const query = `
      SELECT 
        t.id, t.title, t.description, t.category, t.sub_category,
        t.thumbnail, t.tags,
        COUNT(u.id) as usage_count
      FROM smartform.sf_form_templates t
      LEFT JOIN smartform.sf_template_usage u ON t.id = u.template_id
      WHERE t.is_active = true
      GROUP BY t.id, t.title, t.description, t.category, t.sub_category, t.thumbnail, t.tags
      ORDER BY usage_count DESC, t.display_order ASC
      LIMIT $1
    `;
    
    try {
      const result = await pool.query(query, [limit]);
      return result.rows.map(row => ({
        ...row,
        usage_count: parseInt(row.usage_count)
      }));
    } catch (error) {
      this.logger.error('Error getting popular templates:', String(error));
      throw error;
    }
  }

  async getOrgRecommendedTemplates(orgId: string): Promise<Array<Partial<Template>>> {
    const query = `
      SELECT 
        t.id, t.title, t.description, t.category, t.sub_category,
        t.thumbnail, t.tags, t.display_order
      FROM smartform.sf_form_templates t
      INNER JOIN smartform.sf_org_recommended_templates r ON t.id = r.template_id
      WHERE r.org_id = $1 AND t.is_active = true
      ORDER BY r.recommended_at DESC
    `;
    
    try {
      const result = await pool.query(query, [orgId]);
      return result.rows;
    } catch (error) {
      this.logger.error('Error getting org recommended templates:', String(error));
      throw error;
    }
  }

  async createTemplate(template: Omit<Template, 'id' | 'created_at' | 'updated_at'>): Promise<Template> {
    const id = uuidv4();
    const query = `
      INSERT INTO smartform.sf_form_templates (
        id, title, description, category, sub_category, raw_json,
        thumbnail, is_active, display_order, tags, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [
        id,
        template.title,
        template.description,
        template.category,
        template.sub_category,
        template.raw_json,
        template.thumbnail,
        template.is_active ?? true,
        template.display_order ?? 0,
        template.tags
      ]);
      return result.rows[0];
    } catch (error) {
      this.logger.error('Error creating template:', String(error));
      throw error;
    }
  }

  async updateTemplate(templateId: string, updates: Partial<Template>): Promise<Template> {
    const allowedFields = ['title', 'description', 'category', 'sub_category', 'raw_json', 'thumbnail', 'is_active', 'display_order', 'tags'];
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(value);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(templateId);

    const query = `
      UPDATE smartform.sf_form_templates
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, updateValues);
      if (result.rows.length === 0) {
        throw new Error('Template not found');
      }
      return result.rows[0];
    } catch (error) {
      this.logger.error('Error updating template:', String(error));
      throw error;
    }
  }

  async deleteTemplate(templateId: string): Promise<void> {
    // Soft delete by setting is_active = false
    const query = `
      UPDATE smartform.sf_form_templates
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
    `;
    
    try {
      await pool.query(query, [templateId]);
    } catch (error) {
      this.logger.error('Error deleting template:', String(error));
      throw error;
    }
  }
}
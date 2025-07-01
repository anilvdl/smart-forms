import type { DBLogger } from '../config';
import pool from '../index';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';

export interface CreateDraftInput {
  formId: string;
  userId: string;
  title: string;
  rawJson: any;
  version: number;
  thumbnail?: string; 
}

export interface UpdateDraftInput {
  formId: string;
  version: number;
  rawJson: any;
  thumbnail?: string; 
}

export interface FormRawData {
  form_id: string;
  version: number;
  status: 'WIP' | 'PUBLISH';
  raw_json: any;
  user_id: string;
  title: string;
  source_template_id: string;
  short_code: string;
  is_public: boolean;
  org_id: string;
  deleted_at: Date;
  created_at: Date;
  updated_at: Date;
  thumbnail?: string; 
}

export class FormRawDAO {
  private logger: DBLogger;

  constructor(logger: DBLogger) {
    this.logger = logger;
  }
  
  async getLatest(formId: string): Promise<FormRawData | null> {
    const result = await pool.query<FormRawData>(
      'SELECT * FROM smartform.sf_form_raw_data WHERE form_id = $1 ORDER BY version DESC LIMIT 1',
      [formId]
    );
    return result.rows[0] || null;
  }

  async createDraft(args: {
    formId: string;
    userId: string;
    title: string;
    rawJson: any;
    version: number;
    thumbnail: string;
  }): Promise<FormRawData> {
    const { formId, userId, title, rawJson, version, thumbnail } = args;
    const queryText = `
    INSERT INTO smartform.sf_form_raw_data
      (form_id, version, status, raw_json, user_id, title, thumbnail)
    VALUES
      ($1, $2, 'WIP', $3, $4, $5, $6)
    RETURNING
      form_id, version, status, raw_json, user_id, title, created_at, updated_at, thumbnail;
    `;
    const values = [
      formId,
      version,
      JSON.stringify(rawJson),
      userId,
      title,
      thumbnail || null,
    ];
    const result = await pool.query<FormRawData>(queryText, values);
    return result.rows[0];
  }

  async updateDraft(
    formId: string,
    version: number,
    rawJson: any,
    thumbnail: string
  ): Promise<FormRawData> {
    const queryText = `
        UPDATE smartform.sf_form_raw_data
        SET raw_json = $3,
            thumbnail = $4,
            updated_at = NOW()
        WHERE form_id = $1 AND version = $2 AND status = 'WIP'
        RETURNING form_id, version, status, raw_json, user_id, title, created_at, updated_at, thumbnail;
      `;
    const values = [formId, version, JSON.stringify(rawJson), thumbnail || null];
    const result = await pool.query<FormRawData>(queryText, values);
    if (result.rowCount === 0) {
      throw new Error(`Draft not found for formId=${formId} version=${version}`);
    }
    return result.rows[0];
  }

  async getByVersion(
    formId: string,
    version: number
  ): Promise<FormRawData | null> {
    const result = await pool.query(
      'SELECT * FROM smartform.sf_form_raw_data WHERE form_id = $1 AND version = $2',
      [formId, version]
    );
    return result.rows[0] || null;
  }

  async listByUser(
    userId: string,
    limit: number,
    offset: number
  ): Promise<FormRawData[]> {
    const query = `
        SELECT 
          form_id, version, title, status, updated_at, thumbnail
        FROM smartform.sf_form_raw_data
        WHERE user_id = $1 AND status = 'WIP'
        ORDER BY updated_at DESC
        LIMIT $2 OFFSET $3
      `;
    const params = [userId, limit, offset];
    const result = await pool.query<FormRawData>(query, params);
    return result.rows;
  }

  async listByUserByStatus(
    userId: string,
    status: 'WIP' | 'PUBLISH',
    limit: number,
    offset: number
  ): Promise<FormRawData[]> {
    const sql = `SELECT * FROM smartform.sf_form_raw_data
       WHERE user_id = $1 AND status = $2
       ORDER BY updated_at DESC
       LIMIT $3 OFFSET $4`;
    const parameters = [userId, status, limit, offset];
    this.logger.info({ sql, parameters }, "FormRawDAO.listByUserAndStatus");
    const result = await pool.query<FormRawData>(sql, parameters);
    return result.rows;
  }

  /**
   * List published forms for a user (including org forms)
   */
  async listPublishedForms(
    userId: string,
    userOrgIds: string[],
    limit: number,
    offset: number,
    searchTerm?: string,
    sortBy: 'title' | 'updated_at' = 'updated_at',
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<FormRawData[]> {
    // UUID validation regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const conditions: string[] = [
      "status = 'PUBLISH'",
      "deleted_at IS NULL"
    ];
    
    const params: any[] = [];

    // 1) Build access condition (user_id OR org_id)
    let accessCond = `user_id = $${params.length + 1}`;
    params.push(userId);

    // 2) Add org condition using direct string interpolation
    if (userOrgIds.length > 0) {
      // Validate and filter UUIDs
      const validOrgIds = userOrgIds.filter(orgId => uuidRegex.test(orgId));
      // Create comma-separated quoted UUIDs
      if (validOrgIds.length > 0) {
        const orgIdsString = validOrgIds
          .map(orgId => `'${orgId}'`)
          .join(', ');
        accessCond += ` OR org_id IN (${orgIdsString})`;
      }
    }

    conditions.push(`(${accessCond})`);

    // 3) Optional search term
    if (searchTerm?.trim()) {
      conditions.push(`LOWER(title) LIKE LOWER($${params.length + 1})`);
      params.push(`%${searchTerm.trim()}%`);
    }

    // 4) Add limit and offset
    const limitPlaceholder = `$${params.length + 1}`;
    const offsetPlaceholder = `$${params.length + 2}`;
    params.push(limit, offset);

    const query = `
      SELECT *
      FROM smartform.sf_form_raw_data
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ${limitPlaceholder}
      OFFSET ${offsetPlaceholder}
    `;
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get count of published forms for pagination
   */
  async countPublishedForms(
    userId: string,
    userOrgIds: string[],
    searchTerm?: string
  ): Promise<number> {
    const searchCondition = searchTerm 
      ? `AND LOWER(title) LIKE LOWER($2)` 
      : '';
    
    const orgCondition = userOrgIds.length > 0 
      ? `OR org_id =(` + userOrgIds.map(orgId => `'${orgId}'`).join(', ').concat(')')
      : '';
    
    const query = `
      SELECT COUNT(*) FROM smartform.sf_form_raw_data
      WHERE status = 'PUBLISH'
        AND deleted_at IS NULL
        AND (user_id = $1 ${orgCondition})
        ${searchCondition}
    `;

    const params = searchTerm 
      ? [userId, `%${searchTerm}%`]
      : [userId];
    
    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  /**
   * Clone a form (creates new form with new ID)
   */
  async cloneForm(
    sourceFormId: string,
    sourceVersion: number,
    newUserId: string,
    newTitle: string,
    sourceTemplateId?: string
  ): Promise<FormRawData> {
    // Get source form
    const sourceForm = await this.getByVersion(sourceFormId, sourceVersion);
    if (!sourceForm) {
      throw new Error('Source form not found');
    }

    // Generate new form ID and short code
    const newFormId = uuidv4();
    const shortCode = await this.generateUniqueShortCode();

    const query = `
      INSERT INTO smartform.sf_form_raw_data 
        (form_id, user_id, title, raw_json, version, status, 
         source_template_id, short_code, is_public, org_id, thumbnail)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const result = await pool.query(query, [
      newFormId,
      newUserId,
      newTitle,
      sourceForm.raw_json,
      1, // New form starts at version 1
      'WIP', // Cloned forms start as drafts
      sourceTemplateId || sourceForm.source_template_id,
      shortCode,
      sourceForm.is_public,
      null, // New form initially has no org
      sourceForm.thumbnail
    ]);

    return result.rows[0];
  }

  /**
   * Soft delete a form
   */
  async softDeleteForm(formId: string, version: number): Promise<boolean> {
    const query = `
      UPDATE smartform.sf_form_raw_data 
      SET deleted_at = NOW()
      WHERE form_id = $1 AND version = $2
      RETURNING *
    `;

    const result = await pool.query(query, [formId, version]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Get share information for a form
   */
  async getShareInfo(formId: string, version: number): Promise<{
    shortCode: string;
    isPublic: boolean;
    title: string;
  } | null> {
    const query = `
      SELECT short_code, is_public, title 
      FROM smartform.sf_form_raw_data
      WHERE form_id = $1 AND version = $2 AND deleted_at IS NULL
    `;

    const result = await pool.query(query, [formId, version]);
    if (result.rows.length === 0) return null;

    // Generate short code if it doesn't exist
    let { short_code, is_public, title } = result.rows[0];
    if (!short_code) {
      short_code = await this.generateUniqueShortCode();
      await pool.query(
        `UPDATE smartform.sf_form_raw_data 
         SET short_code = $1 
         WHERE form_id = $2 AND version = $3`,
        [short_code, formId, version]
      );
    }

    return { shortCode: short_code, isPublic: is_public, title };
  }

  /**
   * Update form privacy setting
   */
  async updateFormPrivacy(
    formId: string, 
    version: number, 
    isPublic: boolean
  ): Promise<boolean> {
    const query = `
      UPDATE smartform.sf_form_raw_data 
      SET is_public = $1, updated_at = NOW()
      WHERE form_id = $2 AND version = $3
      RETURNING *
    `;

    const result = await pool.query(query, [isPublic, formId, version]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Generate unique short code using PostgreSQL function
   */
  private async generateUniqueShortCode_old(): Promise<string> {
    const result = await pool.query('SELECT generate_unique_short_code() as code');
    return result.rows[0].code;
  }

  private async generateUniqueShortCode(): Promise<string> {
      let attempts = 0;
      const maxAttempts = 10;
      while (attempts < maxAttempts) {
          const shortCode = nanoid();
          const exists = await this.checkCodeExists(shortCode); // check table for duplicates.
          if (!exists) {
              return shortCode;
          }
          attempts++;
      }
      throw new Error('Failed to generate unique code after max attempts');
  }

  private async checkCodeExists(shortCode: string): Promise<Boolean> {
    const query = "SELECT 1 FROM smartform.sf_form_raw_data WHERE short_code = $1";
    const result = await pool.query(query, [shortCode]);
    return result.rows.length > 0;
  }
  /**
   * Get form by short code (for public viewing)
   */
  async getByShortCode(shortCode: string): Promise<FormRawData | null> {
    const query = `
      SELECT * FROM smartform.sf_form_raw_data
      WHERE short_code = $1 
        AND status = 'PUBLISH'
        AND deleted_at IS NULL
        AND is_public = true
    `;

    const result = await pool.query(query, [shortCode]);
    return result.rows[0] || null;
  }

};

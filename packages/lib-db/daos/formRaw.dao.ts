import type { DBLogger } from '../config';
import pool from '../index';

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
};

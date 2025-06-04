import pool from '../index';

export const FormDAO = {
  async createFormEntry(form: { id: string; user_id: string; title: string; data: object }) {
    const result = await pool.query(
      `INSERT INTO smartform.sf_forms (id, user_id, title, data)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [form.id, form.user_id, form.title, form.data]
    );
    return result.rows[0];
  },

  async getFormEntryById(id: string) {
    const result = await pool.query('SELECT * FROM smartform.sf_forms WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async getFormsByUserId(userId: string) {
    const result = await pool.query('SELECT * FROM smartform.sf_forms WHERE user_id = $1', [userId]);
    return result.rows;
  },

  async deleteForm(id: string, userId: string) {
    await pool.query('DELETE FROM smartform.sf_forms WHERE id = $1 AND user_id = $2', [id, userId]);
  }
};
import pool from '../index';
import { validateUser } from '../validator';

export const UserDAO = {
  async getUserById(id: string) {
    const result = await pool.query('SELECT * FROM smartform.sf_users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async getUserByEmail(email: string) {
    const result = await pool.query('SELECT * FROM smartform.sf_users WHERE contact = $1', [email]);
    return result.rows[0] || null;
  },

  async createUser(data: any) {
    const parsed = validateUser(data);
    const result = await pool.query(
      `INSERT INTO smartform.sf_users (id, contact, name, email_verified, image, tier)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [parsed.id, parsed.email, parsed.name, parsed.emailVerified, parsed.image, parsed.tier]
    );
    return result.rows[0];
  },

  async updateUser(id: string, updates: Partial<any>) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((f, i) => `${f} = ${i + 1}`).join(', ');
    const result = await pool.query(
      `UPDATE smartform.sf_users SET ${setClause} WHERE id = ${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },

  async deleteUser(id: string) {
    await pool.query('DELETE FROM smartform.sf_users WHERE id = $1', [id]);
  }
};
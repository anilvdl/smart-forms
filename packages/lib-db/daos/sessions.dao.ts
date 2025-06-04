import pool from '../index';

export const SessionDAO = {
  async createSession(session: { sessionToken: string; userId: string; expires: Date }) {
    await pool.query(
      `INSERT INTO smartform.sf_sessions (session_token, user_id, expires)
       VALUES ($1, $2, $3)`,
      [session.sessionToken, session.userId, session.expires]
    );
    return session;
  },

  async getSessionByToken(token: string) {
    const result = await pool.query(
      'SELECT * FROM smartform.sf_sessions WHERE session_token = $1',
      [token]
    );
    return result.rows[0] || null;
  },

  async deleteSession(token: string) {
    await pool.query('DELETE FROM smartform.sf_sessions WHERE session_token = $1', [token]);
  }
};
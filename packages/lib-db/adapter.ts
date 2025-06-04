import { Adapter, AdapterUser, AdapterAccount } from "next-auth/adapters";
import pool from "./index";
import { validateUser } from "./validator";
import { v4 as uuidv4 } from "uuid";

export function PostgresAdapter(): Adapter {
  return { 
    async createUser(user: Omit<AdapterUser, "id">) {
      const userWithId = { id: uuidv4(), ...user};
      const parsed = validateUser(userWithId);
      const result = await pool.query(
        `INSERT INTO smartform.sf_users (id, contact, name, email_verified, image, tier)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [parsed.id, parsed.email, parsed.name, parsed.emailVerified, parsed.image, parsed.tier]
      );
      return result.rows[0];
    },
    async getUser(id) {
      const result = await pool.query("SELECT * FROM smartform.sf_users WHERE id = $1", [id]);
      return result.rows[0] || null;
    },
    async linkAccount(account: AdapterAccount) {
      await pool.query(
        `INSERT INTO smartform.sf_accounts (
          user_id, provider, provider_account_id, type, access_token,
          refresh_token, expires_at, token_type, scope, id_token, session_state
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        ON CONFLICT (provider, provider_account_id) DO NOTHING`,
        [
          account.userId,
          account.provider,
          account.providerAccountId,
          account.type,
          account.access_token,
          account.refresh_token,
          account.expires_at,
          account.token_type,
          account.scope,
          account.id_token,
          account.session_state,
        ]
      );
    },    
    async getUserByEmail(email) {
      const result = await pool.query("SELECT * FROM smartform.sf_users WHERE contact = $1", [email]);
      return result.rows[0] || null;
    },
    async getUserByAccount({ provider, providerAccountId }: Pick<AdapterAccount, "provider" | "providerAccountId">) {
      console.log("in lib-db\n\n\n getUserByAccount ---> ", provider, providerAccountId);
      console.log("\n\n in lib-db \n\n DB URL: ", process.env.DATABASE_URL);
      let result = { rows: [] };
      try {
       result = await pool.query(
        `SELECT u.* FROM smartform.sf_users u
         INNER JOIN smartform.sf_accounts a ON u.id = a.user_id
         WHERE a.provider = $1 AND a.provider_account_id = $2`,
        [provider, providerAccountId]
      );
    } catch (err) {
      console.error("Error in getUserByAccount:", err);
      if (err instanceof Error) {
        throw new Error("Database query failed. Error: " + err.message);
      }
      throw new Error("Database query failed. Unknown error occurred.");
    }
      console.log("getUserByAccount result ---> ", result.rows);
      return result.rows[0] || null;
    },    
    async createSession(session) {
      await pool.query(
        `INSERT INTO smartform.sf_sessions (session_token, user_id, expires)
         VALUES ($1, $2, $3)`,
        [session.sessionToken, session.userId, session.expires]
      );
      return session;
    },
    async getSessionAndUser(sessionToken) {
      const result = await pool.query(
        `SELECT s.*, u.* FROM smartform.sf_sessions s
         JOIN smartform.sf_users u ON u.id = s.user_id
         WHERE s.session_token = $1`,
        [sessionToken]
      );
      if (!result.rows.length) return null;
      const { session_token, user_id, expires, ...user } = result.rows[0];
      return {
        session: { sessionToken: session_token, userId: user_id, expires },
        user
      };
    },
    async deleteSession(sessionToken) {
      await pool.query("DELETE FROM smartform.sf_sessions WHERE session_token = $1", [sessionToken]);
    },
    async deleteUser(userId) {
      await pool.query(
        `DELETE FROM smartform.sf_users WHERE id = $1`,
        [userId]
      );
    },

    async updateUser(user) {
      const result = await pool.query(
        `UPDATE smartform.sf_users SET
          name = $1,
          contact = $2,
          email_verified = $3,
          image = $4,
          updated_at = NOW()
         WHERE id = $5 RETURNING *`,
        [
          user.name,
          user.email,
          user.emailVerified,
          user.image,
          user.id,
        ]
      );
      return result.rows[0];
    },

    async updateSession(session) {
      const result = await pool.query(
        `UPDATE smartform.sf_sessions SET
          expires = $1
         WHERE session_token = $2 RETURNING *`,
        [session.expires, session.sessionToken]
      );
      return result.rows[0];
    },

    async unlinkAccount({ provider, providerAccountId }: Pick<AdapterAccount, "provider" | "providerAccountId">) {
      await pool.query(
        `DELETE FROM smartform.sf_accounts
         WHERE provider = $1 AND provider_account_id = $2`,
        [provider, providerAccountId]
      );
    },
  };
}
import { FastifyPluginAsync } from "fastify";
import { PostgresAdapter } from "@smartforms/lib-db/adapter";
import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
} from "next-auth/adapters";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail, sendWelcomeEmail } from "../services/emailService";
import crypto from "crypto";
import pool from "@smartforms/lib-db/index"; 

interface RegisterBody {
  name: string;
  email: string;
  password: string;
  companyName?: string;
  inviteToken?: string;
}

// Tell TS that PostgresAdapter() implements every Adapter method
const adapter = PostgresAdapter() as Required<Adapter>;

const authRoutes: FastifyPluginAsync = async (app) => {
  // ── Users ─────────────────────────────────────────────────────────
  app.post<{ Body: Omit<AdapterUser, "id"> }>("/users", async (req, reply) => {
    try {
      let payload = req.body;
      if(payload.emailVerified && typeof payload.emailVerified === "string") {
        // Convert emailVerified to Date if it's a string
        payload.emailVerified = new Date(payload.emailVerified);
      }
      const user = await adapter.createUser(payload);
      reply.code(201).send(user);
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({ error: { code: "CREATE_USER_FAILED", message: "Could not create user" } });
    }
  });

  app.get<{ Params: { id: string } }>("/users/:id", async (req, reply) => {
    try {
      const user = await adapter.getUser(req.params.id);
      if (!user) {
        return reply
          .code(404)
          .send({ error: { code: "USER_NOT_FOUND", message: "User not found" } });
      }
      reply.send(user);
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({ error: { code: "GET_USER_FAILED", message: "Could not fetch user" } });
    }
  });

  app.get<{ Querystring: { email: string } }>("/users", async (req, reply) => {
    try {
      const user = await adapter.getUserByEmail(req.query.email);
      if (!user) {
        return reply
          .code(404)
          .send({ error: { code: "USER_NOT_FOUND", message: "User not found" } });
      }
      reply.send(user);
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({
          error: { code: "GET_USER_BY_EMAIL_FAILED", message: "Could not fetch user by email" },
        });
    }
  });

  app.get<{
    Querystring: { provider: string; providerAccountId: string };
  }>("/users/by-account", async (req, reply) => {
    try {
      const user = await adapter.getUserByAccount({
        provider: req.query.provider,
        providerAccountId: req.query.providerAccountId,
      });
      if (!user) {
        return reply
          .code(404)
          .send({ error: { code: "ACCOUNT_NOT_LINKED", message: "No user for that account" } });
      }
      reply.send(user);
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({
          error: { code: "GET_USER_BY_ACCOUNT_FAILED", message: "Could not fetch user by account" },
        });
    }
  });

  app.put<{ Params: { id: string }; Body: Partial<AdapterUser> }>("/users/:id", async (req, reply) => {
    try {
      const user = await adapter.updateUser({ id: req.params.id, ...req.body });
      reply.send(user);
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({ error: { code: "UPDATE_USER_FAILED", message: "Could not update user" } });
    }
  });

  app.delete<{ Params: { id: string } }>("/users/:id", async (req, reply) => {
    try {
      await adapter.deleteUser(req.params.id);
      reply.code(204).send();
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({ error: { code: "DELETE_USER_FAILED", message: "Could not delete user" } });
    }
  });

  // ── Accounts ────────────────────────────────────────────────────────
  app.post<{ Body: AdapterAccount }>("/accounts", async (req, reply) => {
    try {
      const result = await adapter.linkAccount(req.body);
      reply.send(result);
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({ error: { code: "LINK_ACCOUNT_FAILED", message: "Could not link account" } });
    }
  });

  app.delete<{
    Querystring: { provider: string; providerAccountId: string };
  }>("/accounts", async (req, reply) => {
    try {
      await adapter.unlinkAccount({
        provider: req.query.provider,
        providerAccountId: req.query.providerAccountId,
      });
      reply.code(204).send();
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({ error: { code: "UNLINK_ACCOUNT_FAILED", message: "Could not unlink account" } });
    }
  });

  // ── Sessions ────────────────────────────────────────────────────────
  app.post<{ Body: AdapterSession }>("/sessions", async (req, reply) => {
    try {
      const sess = await adapter.createSession(req.body);
      reply.code(201).send(sess);
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({ error: { code: "CREATE_SESSION_FAILED", message: "Could not create session" } });
    }
  });

  app.get<{ Params: { sessionToken: string } }>("/sessions/:sessionToken", async (req, reply) => {
    try {
      const sessUser = await adapter.getSessionAndUser(req.params.sessionToken);
      if (!sessUser) {
        return reply
          .code(404)
          .send({ error: { code: "SESSION_NOT_FOUND", message: "Session not found" } });
      }
      reply.send(sessUser);
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({
          error: { code: "GET_SESSION_FAILED", message: "Could not fetch session and user" },
        });
    }
  });

  app.put<{
    Params: { sessionToken: string };
    Body: Partial<AdapterSession>;
  }>("/sessions/:sessionToken", async (req, reply) => {
    try {
      const updated = await adapter.updateSession({
        sessionToken: req.params.sessionToken,
        ...req.body,
      });
      reply.send(updated);
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({ error: { code: "UPDATE_SESSION_FAILED", message: "Could not update session" } });
    }
  });

  app.delete<{ Params: { sessionToken: string } }>("/sessions/:sessionToken", async (req, reply) => {
    try {
      await adapter.deleteSession(req.params.sessionToken);
      reply.code(204).send();
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({ error: { code: "DELETE_SESSION_FAILED", message: "Could not delete session" } });
    }
  });

  // ── Registration ───────────────────────────────────────────────────
  app.post<{ Body: RegisterBody }>("/auth/register", async (req, reply) => {
    const { name, email, password, companyName, inviteToken } = req.body;
    
    try {
      // Check if user already exists
      const existingUser = await adapter.getUserByEmail(email);
      if (existingUser) {
        return reply.status(409).send({ 
          error: { 
            code: "USER_EXISTS", 
            message: "An account with this email already exists" 
          } 
        });
      }

      // Begin transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // Create user
        const userId = uuidv4();
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        const userResult = await client.query(
          `INSERT INTO smartform.sf_users (id, contact, name, email_verified, tier)
          VALUES ($1, $2, $3, NULL, 'FREE') RETURNING *`,
          [userId, email, name]
        );
        
        // Store password hash (you might need a separate table for this)
        // For now, we'll store it in a user_credentials table
        if(password) {
          // Hash password
          const passwordHash = await bcrypt.hash(password, 12);
          await client.query(
            `INSERT INTO smartform.sf_user_credentials (user_id, password_hash)
            VALUES ($1, $2)`,
            [userId, passwordHash]
          );
        }
        
        // Create verification token
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getMinutes() + 15); // 15 minutes expiration
        
        await client.query(
          `INSERT INTO smartform.sf_verification_tokens (identifier, token, expires)
          VALUES ($1, $2, $3)`,
          [email, verificationToken, expiresAt]
        );
        
        // Handle organization creation
        let orgId: string;
        let userRole: string;
        
        if (inviteToken) {
          // Handle invite flow
          const inviteResult = await client.query(
            `SELECT * FROM smartform.sf_invites 
            WHERE token = $1 AND expires_at > NOW() AND accepted_at IS NULL`,
            [inviteToken]
          );
          
          if (inviteResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return reply.status(400).send({ 
              error: { 
                code: "INVALID_INVITE", 
                message: "Invalid or expired invitation" 
              } 
            });
          }
          
          const invite = inviteResult.rows[0];
          orgId = invite.org_id;
          userRole = invite.role_requested;
          
          // Accept the invite
          await client.query(
            `UPDATE smartform.sf_invites 
            SET accepted_at = NOW() 
            WHERE id = $1`,
            [invite.id]
          );
        } else {
          // Create personal organization
          orgId = uuidv4();
          userRole = 'OWNER'; 
          
          const orgName = companyName || `${name}'s SmartForm Account`;
          
          await client.query(
            `INSERT INTO smartform.sf_org_accounts 
            (id, name, billing_plan, billing_status, created_at, updated_at)
            VALUES ($1, $2, 'PENDING', 'ACTIVE', NOW(), NOW())`,
            [orgId, orgName]
          );
        }
        
        // Add user to organization
        await client.query(
          `INSERT INTO smartform.sf_user_orgs 
          (user_id, org_id, role, is_active, created_at)
          VALUES ($1, $2, $3, true, NOW())`,
          [userId, orgId, userRole]
        );
        
        // Set default organization preference
        await client.query(
          `INSERT INTO smartform.sf_user_preferences 
          (user_id, default_org_id, created_at, updated_at)
          VALUES ($1, $2, NOW(), NOW())
          ON CONFLICT (user_id) 
          DO UPDATE SET default_org_id = $2, updated_at = NOW()`,
          [userId, orgId]
        );
        
        // Create audit log
        await client.query(
          `INSERT INTO smartform.sf_audit_logs 
          (id, org_id, user_id, event_type, metadata, created_at)
          VALUES ($1, $2, $3, 'USER_REGISTERED', $4, NOW())`,
          [
            uuidv4(),
            orgId,
            userId,
            JSON.stringify({ 
              email, 
              via_invite: !!inviteToken,
              org_name: companyName || `${name}'s SmartForm Account`
            })
          ]
        );
        
        await client.query('COMMIT');
        
        // Send verification email
        await sendVerificationEmail({
          to: email,
          name: name,
          verificationToken: verificationToken,
        });
        
        reply.status(201).send({
          success: true,
          message: "Registration successful. Please check your email to verify your account.",
          userId: userId,
        });
        
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      
    } catch (error) {
      req.log.error(error);
      reply.status(500).send({ 
        error: { 
          code: "REGISTRATION_FAILED", 
          message: "Could not complete registration" 
        } 
      });
    }
  });

  // Add email verification endpoint
  app.get<{ Params: { token: string } }>("/auth/verify-email/:token", async (req, reply) => {
    const { token } = req.params;
    
    try {
      // Check if token exists and is valid
      const tokenResult = await pool.query(
        `SELECT * FROM smartform.sf_verification_tokens 
        WHERE token = $1 AND expires > NOW()`,
        [token]
      );
      
      if (tokenResult.rows.length === 0) {
        return reply.status(400).send({ 
          error: { 
            code: "INVALID_TOKEN", 
            message: "Invalid or expired verification token" 
          } 
        });
      }
      
      const { identifier: email } = tokenResult.rows[0];
      
      // Update user as verified
      await pool.query(
        `UPDATE smartform.sf_users 
        SET email_verified = NOW() 
        WHERE contact = $1`,
        [email]
      );
      
      // Delete the used token
      await pool.query(
        `DELETE FROM smartform.sf_verification_tokens 
        WHERE token = $1`,
        [token]
      );
      
      // Get user details for response
      const userResult = await pool.query(
        `SELECT id, name, contact as email 
        FROM smartform.sf_users 
        WHERE contact = $1`,
        [email]
      );
      
      reply.send({
        success: true,
        message: "Email verified successfully",
        user: userResult.rows[0]
      });
      
    } catch (error) {
      req.log.error(error);
      reply.status(500).send({ 
        error: { 
          code: "VERIFICATION_FAILED", 
          message: "Could not verify email" 
        } 
      });
    }
  });

  app.post<{ Body: { email: string } }>("/auth/resend-verification", async (req, reply) => {
    const { email } = req.body;
    
    if (!email) {
      return reply.status(400).send({ 
        error: { 
          code: "INVALID_REQUEST", 
          message: "Email is required" 
        } 
      });
    }

    try {
      // Check if user exists
      const userResult = await pool.query(
        `SELECT id, name, contact, email_verified 
        FROM smartform.sf_users 
        WHERE contact = $1`,
        [email]
      );
      
      if (userResult.rows.length === 0) {
        return reply.status(404).send({ 
          error: { 
            code: "USER_NOT_FOUND", 
            message: "No account found with this email" 
          } 
        });
      }
      
      const user = userResult.rows[0];
      
      // Check if already verified
      if (user.email_verified) {
        return reply.status(400).send({ 
          error: { 
            code: "ALREADY_VERIFIED", 
            message: "Email is already verified" 
          } 
        });
      }
      
      // Check for existing token
      const existingTokenResult = await pool.query(
        `SELECT * FROM smartform.sf_verification_tokens 
        WHERE identifier = $1 AND expires > NOW()`,
        [email]
      );
      
      let verificationToken: string;
      
      if (existingTokenResult.rows.length > 0) {
        // Use existing token
        verificationToken = existingTokenResult.rows[0].token;
      } else {
        // Generate new token
        verificationToken = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getMinutes() + 15); // 15 minutes expiration
        
        // Delete any expired tokens for this email
        await pool.query(
          `DELETE FROM smartform.sf_verification_tokens 
          WHERE identifier = $1`,
          [email]
        );
        
        // Insert new token
        await pool.query(
          `INSERT INTO smartform.sf_verification_tokens (identifier, token, expires)
          VALUES ($1, $2, $3)`,
          [email, verificationToken, expiresAt]
        );
      }
      
      // Send verification email
      await sendVerificationEmail({
        to: email,
        name: user.name || 'User',
        verificationToken: verificationToken,
      });
      
      reply.send({
        success: true,
        message: "Verification email sent successfully"
      });
      
    } catch (error) {
      req.log.error(error);
      reply.status(500).send({ 
        error: { 
          code: "RESEND_FAILED", 
          message: "Could not resend verification email" 
        } 
      });
    }
  });

  // Add this endpoint for social auth signup completion
  app.post<{ Body: { 
    userId: string;
    name: string;
    email: string;
    provider: string;
  }}>("/social-signup", async (req, reply) => {
    const { userId, name, email, provider } = req.body;
    
    try {
      // Check if user needs organization setup
      const orgCheckResult = await pool.query(
        `SELECT org_id FROM smartform.sf_user_orgs WHERE user_id = $1`,
        [userId]
      );
      
      if (orgCheckResult.rows.length > 0) {
        // User already has organization
        return reply.send({
          success: true,
          organizationId: orgCheckResult.rows[0].org_id,
          needsOnboarding: false
        });
      }
      
      // Create organization for social auth user
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        const orgId = uuidv4();
        const orgName = `${name}'s SmartForm Account`;

        // Update user as verified for social auth
        await pool.query(
          `UPDATE smartform.sf_users 
          SET email_verified = NOW() 
          WHERE contact = $1`,
          [email]
        );
        
        // Create organization
        await client.query(
          `INSERT INTO smartform.sf_org_accounts 
          (id, name, billing_plan, billing_status, created_at, updated_at)
          VALUES ($1, $2, 'PENDING', 'ACTIVE', NOW(), NOW())`,
          [orgId, orgName]
        );
        
        // Add user as owner
        await client.query(
          `INSERT INTO smartform.sf_user_orgs 
          (user_id, org_id, role, is_active, created_at)
          VALUES ($1, $2, 'OWNER', true, NOW())`,
          [userId, orgId]
        );
        
        // Set default organization preference
        await client.query(
          `INSERT INTO smartform.sf_user_preferences 
          (user_id, default_org_id, created_at, updated_at)
          VALUES ($1, $2, NOW(), NOW())
          ON CONFLICT (user_id) 
          DO UPDATE SET default_org_id = $2, updated_at = NOW()`,
          [userId, orgId]
        );
        
        // Create audit log
        await client.query(
          `INSERT INTO smartform.sf_audit_logs 
          (id, org_id, user_id, event_type, metadata, created_at)
          VALUES ($1, $2, $3, 'SOCIAL_AUTH_SIGNUP', $4, NOW())`,
          [
            uuidv4(),
            orgId,
            userId,
            JSON.stringify({ 
              email, 
              provider,
              org_name: orgName
            })
          ]
        );
        
        await client.query('COMMIT');
        // Send welcome email (social auth users are pre-verified)
        await sendWelcomeEmail({
          to: email,
          name: name,
        });
        
        reply.send({
          success: true,
          organizationId: orgId,
          needsOnboarding: true
        });
        
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      
    } catch (error) {
      req.log.error(error);
      reply.status(500).send({ 
        error: { 
          code: "SOCIAL_SIGNUP_FAILED", 
          message: "Could not complete social signup" 
        } 
      });
    }
  });
};

export default authRoutes;

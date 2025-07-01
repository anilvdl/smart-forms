import type { FastifyRequest } from 'fastify';
import { getToken } from 'next-auth/jwt';

const NEXTAUTH_SECRET = process.env.SFORMS_NEXTAUTH_SECRET;
if (!NEXTAUTH_SECRET) {
  throw new Error('Missing environment variable SFORMS_NEXTAUTH_SECRET');
}

/**
 * SessionUser: the payload we expect in our JWT.
 */
export interface SessionUser {
  id: string;                // user ID
  email: string;             // user email
  role: string;              // e.g. 'OWNER', 'ADMIN'
  accountIds?: string[];     // all accounts this user belongs to
  activeAccountId?: string;  // currently selected account
}

/**
 * Session: wrapper for SessionUser.
 */
export interface Session {
  user: SessionUser;
}

/**
 * getSessionFromRequest
 *
 * Verifies and extracts the NextAuth JWT from the incoming Fastify request.
 *
 * We cast `request.raw` to `any` here because next-auth expects an object
 * with cookies or headers; in practice it will read from the Authorization
 * header if present.
 *
 * @param request - FastifyRequest
 * @returns a Session object or null if unauthenticated
 */
export async function getSessionFromRequest(
  req: FastifyRequest
): Promise<Session | null> {
  
  const raw = req.headers['x-user-info'] as string | undefined;

  if (!raw) {
    throw new Error('Missing x-user-info header');
  }
  let userInfo: any;
  try {
    // parse back into your SessionUser
    userInfo = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'))
  } catch (err) {
    throw new Error('Invalid x-user-info header format. Error: ' + err);
  }
  
  // Extract the fields we care about
  const {
    id,
    email,
    role,
    orgs,             // this was your field in the header
    activeOrgId,      // note: activeOrgId, not activeAccountId
  } = userInfo as {
    id?: string;
    email?: string;
    role?: string;
    orgs?: { orgId: string; role: string }[];
    activeOrgId?: string;
  };

  if (!id || !email || !role) {
    return null;
  }
  const accountIds = Array.isArray(orgs)
    ? orgs.map(o => o.orgId)
    : [];

  const session = {
    user: {
      id,
      email,
      role,
      accountIds,
      activeAccountId: activeOrgId,
    }, 
  };
  return session;
}
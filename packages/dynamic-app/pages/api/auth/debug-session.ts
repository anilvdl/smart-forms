import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './[...nextauth]';
import { getToken } from 'next-auth/jwt';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const token = await getToken({ req });
  
  res.json({
    hasSession: !!session,
    sessionData: session,
    hasToken: !!token,
    tokenData: token ? {
      id: token.id,
      email: token.email,
      needsOnboarding: token.needsOnboarding,
      emailVerified: token.emailVerified,
      orgs: token.orgs,
    } : null,
    cookies: req.headers.cookie,
  });
}
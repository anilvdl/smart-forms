import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { httpClient } from '@smartforms/lib-middleware'

const serviceUrl = process.env.FORMS_SERVICE_URL!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getSession({ req })
    console.log('[proxy].users/preferences.ts ->>>> session:', session);
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    console.log(`[proxy].users/preferences.ts ->>>> calling '${serviceUrl}/api/users/${session.user.id}/preferences' with params: ${req.query} and method: ${req.method}`);

    // Proxy to backend service
    const response = await httpClient({
      method: req.method,
      url: `${serviceUrl}/api/users/${session.user.id}/preferences`,
      headers: req.headers,
      data: req.method === 'PATCH' ? req.body : undefined,
    })
    
    return res.status(response.status).json(response.data)
    
  } catch (error: any) {
    console.error('User preferences proxy error:', error)
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data)
    }
    
    return res.status(500).json({ error: 'Internal server error' })
  }
}
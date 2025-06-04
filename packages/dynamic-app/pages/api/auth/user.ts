import type { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, httpClient } from '@smartforms/lib-middleware';

const SERVICE_URL = process.env.AUTH_SERVICE_URL!;
const API_KEY     = process.env.AUTH_SERVICE_KEY!;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, name } = req.body as { email: string; name: string };

    // 1) Check if user already exists
    try {
      const url = `${SERVICE_URL}/auth/users?email=${encodeURIComponent(email)}`;
      await httpClient.get(url, { headers: { 'x-api-key': API_KEY } });
      // 200 OK => user found
      return res.status(400).json({ message: 'User already exists' });
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Error checking existing user:', err);
        return res.status(500).json({ message: 'Error checking user' });
      }
      // 404 => not found, proceed
    }

    // 2) Create new user
    try {
      const url = `${SERVICE_URL}/auth/users`;
      const payload = {
        email,
        name,
        emailVerified: null,
        image: null,
        tier: 'free',
      };
      const createRes = await httpClient.post(url, payload, {
        headers: { 'x-api-key': API_KEY }
      });
      return res.status(201).json(createRes.data);
    } catch (err: any) {
      console.error('Error creating user:', err);
      return res.status(500).json({ message: 'Error creating user' });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withMiddleware(handler);

import { withMiddleware } from '@smartforms/lib-middleware';
import { httpClient }     from '@smartforms/lib-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken }       from 'next-auth/jwt';

const SERVICE_URL     = process.env.ADMIN_SERVICE_URL || process.env.FORMS_SERVICE_URL!;
const API_KEY         = process.env.AUTH_SERVICE_KEY!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

export interface FollowupSettings {
  formId: string;
  enabled: boolean;
  distributionGroupId: string | null;
  adHocEmails: string[] | null;
  intervalDays: number | null;
  skipWeekends: boolean;
  sendFinalReminder: boolean;
  templateSubject: string | null;
  templateBody: string | null;
  updatedAt: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) authenticate
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  if (!token?.jwtToken) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Not logged in' });
  }
  const headers = {
    'x-api-key': API_KEY,
    Authorization: `Bearer ${token.jwtToken}`,
  };

  const { formId } = req.query as { formId?: string };
  if (!formId) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'formId is required' });
  }
  const url = `${SERVICE_URL}/admin/followup-settings/${encodeURIComponent(formId)}/followup`;

  try {
    if (req.method === 'GET') {
      const response = await httpClient.get<FollowupSettings>(url, { headers });
      return res.status(response.status).json(response.data);
    }

    if (req.method === 'POST') {
      // Expect full settings in body
      const payload = req.body;
      const response = await httpClient.post<FollowupSettings>(url, payload, { headers });
      return res.status(response.status).json(response.data);
    }

    if (req.method === 'DELETE') {
      const response = await httpClient.delete<{ success: boolean }>(url, { headers });
      return res.status(response.status).json(response.data);
    }

    res.setHeader('Allow', ['GET','POST','DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);

  } catch (err: any) {
    console.error(`${req.method} ${url} failed:`, err);
    const status = err.response?.status || 500;
    return res
      .status(status)
      .json({ code: 'INTERNAL_ERROR', message: err.message });
  }
}

export default withMiddleware(handler);
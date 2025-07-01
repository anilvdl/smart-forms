import useSWR, { SWRResponse } from 'swr';

export interface Invite {
  id: string;
  invited_email: string;
  role_requested: 'ADMIN' | 'DEVELOPER' | 'VIEWER';
  expires_at: string;
  accepted_at: string | null;
}

export type UseInvitesResponse = Invite[];

// same fetcher as above
const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) throw new Error(`Error fetching ${url}: ${res.statusText}`);
    return res.json();
  });

/**
 * Fetches pending invites for the current org
 */
export function useInvites(orgId: string): SWRResponse<UseInvitesResponse, Error> {
  const endpoint = `/api/admin/invites?orgId=${encodeURIComponent(orgId)}`;
  return useSWR<UseInvitesResponse, Error>(endpoint, fetcher, {
    revalidateOnFocus: false,
  });
}

/**
 * POST /api/admin/invites/[id]/resend
 */
export async function resendInvite(id: string): Promise<void> {
  const res = await fetch(`/api/admin/invites/${id}/resend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Failed to resend invite ${id}: ${res.statusText}`);
}

/**
 * DELETE /api/admin/invites/[id]
 */
export async function cancelInvite(id: string): Promise<void> {
  const res = await fetch(`/api/admin/invites/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to cancel invite ${id}: ${res.statusText}`);
}
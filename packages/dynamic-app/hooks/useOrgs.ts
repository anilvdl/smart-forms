import useSWR, { SWRResponse } from 'swr';

export interface Org {
  orgId: string;
  role: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'VIEWER';
  isDefault: boolean;
}

export interface UseOrgsResponse {
  defaultOrgId?: string;
  orgs: Org[];
}

const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) throw new Error(`Error fetching ${url}: ${res.statusText}`);
    return res.json();
  });

export function useOrgs(): SWRResponse<UseOrgsResponse, Error> & {
  setDefaultOrg: (orgId: string) => Promise<void>;
} {
  const key = '/api/admin/user-orgs';
  const swr = useSWR<UseOrgsResponse, Error>(key, fetcher, {
    revalidateOnFocus: false,
  });

  const setDefaultOrg = async (orgId: string) => {
    const res = await fetch(key, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId }),
    });
    if (!res.ok) throw new Error(`Failed to set default org: ${res.statusText}`);
    // revalidate to pull in the updated defaultOrgId
    await swr.mutate();
  };

  return { ...swr, setDefaultOrg };
}
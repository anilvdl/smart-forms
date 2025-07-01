import useSWR, { SWRResponse } from 'swr';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'VIEWER';
  isActive: boolean;
  lastLogin?: string;
}

export interface UseUsersParams {
  page?: number;
  pageSize?: number;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Error fetching ${url}: ${res.statusText}`);
    return res.json();
  });

/**
 * useUsers
 *
 * Fetches a paginated, sortable list of users from `/api/admin/users`.
 *
 * @param params.page      Page number (1-based)
 * @param params.pageSize  Items per page
 * @param params.sortKey   Column key to sort by
 * @param params.sortDir   'asc' or 'desc'
 * @param params.search    Optional full-text filter
 */
export function useUsers(
  params: UseUsersParams = {}
): SWRResponse<UsersResponse, Error> {
  const { page = 1, pageSize = 20, sortKey, sortDir, search } = params;

  // Build query string
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('pageSize', String(pageSize));
  if (sortKey) qs.set('sortKey', sortKey);
  if (sortDir) qs.set('sortDir', sortDir);
  if (search) qs.set('search', search);

  const endpoint = `/api/admin/users?${qs.toString()}`;

  // Pass an explicit empty object so fetcher always gets two args
  const swr = useSWR<UsersResponse, Error>(
    [endpoint, {}],
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      keepPreviousData: true,
    }
  );

  const { data, error, mutate } = swr;

  // Force initial loading state whenever data is undefined & no error yet
  const initialLoading = swr.data === undefined && swr.error === undefined;
  const isValidating = initialLoading || swr.isValidating;
  const isLoading = initialLoading;

  return {
    ...swr,
    data,
    error,
    mutate,
    isValidating,
    isLoading,
  };
}
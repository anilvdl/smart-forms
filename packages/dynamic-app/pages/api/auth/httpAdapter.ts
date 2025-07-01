import type {
  Adapter,
  AdapterUser,
  AdapterSession,
  AdapterAccount,
} from "next-auth/adapters";

// NextAuth doesn't export this, so we declare it ourselves:
export interface AdapterSessionAndUser {
  session: AdapterSession;
  user: AdapterUser;
}
export function HttpAdapter(opts: {
  baseUrl: string;
  apiKey: string;
}): Adapter {
  const headers = {
    "x-api-key": opts.apiKey,
    "Content-Type": "application/json",
  };

  async function call<T>(
    path: string,
    method: string,
    body?: any,
    allowNotFound: boolean = false
  ): Promise<T> {
    const res = await fetch(opts.baseUrl + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (allowNotFound && res.status === 404) {
      return null as any;
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`HTTP ${res.status} ${res.statusText}:`, errorText);
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${errorText}`);
    }
    if (res.status === 204) return undefined as any;
    return (await res.json()) as T;
  }

  return {
    createUser: (user: AdapterUser) => {
      return call<AdapterUser>("/auth/users", "POST", user);
    },
    getUser: (id) => call<AdapterUser | null>(`/auth/users/${id}`, "GET"),
    getUserByEmail: (email) =>
      call<AdapterUser | null>(
        `/auth/users?email=${encodeURIComponent(email)}`,
        "GET",
        undefined,
        true
      ),
    getUserByAccount: (acct) => {
      return call<AdapterUser | null>(
        `/auth/users/by-account?provider=${encodeURIComponent(
          acct.provider
        )}&providerAccountId=${encodeURIComponent(acct.providerAccountId)}`,
        "GET",
        undefined,
        true
      ); 
    },
    updateUser: (user) => call<AdapterUser>(`/auth/users/${user.id}`, "PUT", user),
    deleteUser: (id) => call<void>(`/auth/users/${id}`, "DELETE"),
    linkAccount: (acct: AdapterAccount) => {
      return call<void>("/auth/accounts", "POST", acct, true);
    },
    unlinkAccount: (acct: AdapterAccount) =>
      call<void>(
        `/auth/accounts?provider=${encodeURIComponent(
          acct.provider
        )}&providerAccountId=${encodeURIComponent(acct.providerAccountId)}`,
        "DELETE"
      ),
    createSession: (sess) => call<AdapterSession>("/auth/sessions", "POST", sess),
    getSessionAndUser: (token) =>
      call<AdapterSessionAndUser>(
        `/auth/sessions/${encodeURIComponent(token)}`,
        "GET"
      ),
    updateSession: (sess) =>
      call<AdapterSession>(
        `/auth/sessions/${encodeURIComponent(sess.sessionToken)}`,
        "PUT",
        sess
      ),
    deleteSession: (token) =>
      call<void>(
        `/auth/sessions/${encodeURIComponent(token)}`,
        "DELETE"
      ),
  };
}

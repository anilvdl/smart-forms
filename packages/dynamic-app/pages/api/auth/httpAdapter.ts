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
    body?: any
  ): Promise<T> {
    console.log("Calling .......> ", opts.baseUrl + path, method, body);
    const res = await fetch(opts.baseUrl + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    if (res.status === 204) return undefined as any;
    return (await res.json()) as T;
  }

  return {
    createUser: (user: AdapterUser) => call<AdapterUser>("/auth/users", "POST", user),
    getUser: (id) => call<AdapterUser | null>(`/auth/users/${id}`, "GET"),
    getUserByEmail: (email) =>
      call<AdapterUser | null>(
        `/auth/users?email=${encodeURIComponent(email)}`,
        "GET"
      ),
    getUserByAccount: (acct) =>
      call<AdapterUser | null>(
        `/auth/users/by-account?provider=${encodeURIComponent(
          acct.provider
        )}&providerAccountId=${encodeURIComponent(acct.providerAccountId)}`,
        "GET"
      ),
    updateUser: (user) => call<AdapterUser>(`/auth/users/${user.id}`, "PUT", user),
    deleteUser: (id) => call<void>(`/auth/users/${id}`, "DELETE"),
    linkAccount: (acct: AdapterAccount) => call<void>("/auth/accounts", "POST", acct),
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

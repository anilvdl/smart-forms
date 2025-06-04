"use client";

import { useRouter }    from "next/navigation";
import { useSession }   from "next-auth/react";

export function navigationUtil() {
  const router  = useRouter();
  const { data: session } = useSession();    // on static-site this will be `null`

  // these must be NEXT_PUBLIC_… so they survive the static export
  const AUTH_BASE   = process.env.NEXT_PUBLIC_SFORMS_AUTH_BASE_URL!;
  const STATIC_BASE = process.env.NEXT_PUBLIC_SFORMS_STATIC_BASE_URL!;

  function makeUrl(path: string) {
    // === 1) Always send login & signup to the auth server ===
    if (path === "/login" || path === "/signup") {
      return `${AUTH_BASE}${path}`;
    }

    // === 2) Sign-out goes back to the static landing page ===
    if (path === "/signout") {
      // clear any client storage if you like
      localStorage.removeItem("googleUser");
      return `${STATIC_BASE}/`;
    }

    // check for /contact link and redirect to the static page of the same name
    if (path === "/contact") {
      return `${STATIC_BASE}${path}`;
    }

    // === 3) If they’re signed in, all pages live on the auth server ===
    if (session?.user) {
      return `${AUTH_BASE}${path}`;
    }

    // === 4) Otherwise, public (not-signed-in) pages stay static ===
    return `${STATIC_BASE}${path}`;
  }

  function navigate(path: string) {
    const url = makeUrl(path);

    // same-origin? strip off the origin and do a client push
    if (typeof window !== "undefined" && url.startsWith(window.location.origin)) {
      const relative = url.slice(window.location.origin.length) || "/";
      router.push(relative);

    // cross-origin? full reload
    } else {
      window.location.href = url;
    }
  }

  return { makeUrl, navigate };
}
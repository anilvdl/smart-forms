import type { NextApiRequest, NextApiResponse } from "next";
import { getToken, encode } from "next-auth/jwt";
import { serialize } from "cookie";
import { httpClient } from "@smartforms/lib-middleware";

const SERVICE_URL      = process.env.FORMS_SERVICE_URL!;   // or ADMIN_SERVICE_URL if you prefer
const API_KEY          = process.env.AUTH_SERVICE_KEY!;
const NEXTAUTH_SECRET  = process.env.NEXTAUTH_SECRET!;
const TOKEN_COOKIE_NAME = `next-auth.session-token`;      // adjust if you’ve customized

if (!SERVICE_URL || !API_KEY || !NEXTAUTH_SECRET) {
  throw new Error(
    "Missing one of FORMS_SERVICE_URL, AUTH_SERVICE_KEY or NEXTAUTH_SECRET"
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 1) Validate existing NextAuth JWT
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  if (!token?.jwtToken || !token.id) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // 2) Validate payload
  const { orgId } = req.body as { orgId?: string };
  if (!orgId) {
    return res.status(400).json({ message: "Missing required field: orgId" });
  }

  try {
    // 3) Tell backend to switch default-org
    await httpClient.post(
      `${SERVICE_URL}/admin/switch-account`,
      { orgId },
      {
        headers: {
          "x-api-key": API_KEY,
          Authorization: `Bearer ${token.jwtToken}`,
        },
      }
    );

    // 4) Build updated token payload
    const newToken = {
      ...token,
      activeOrgId: orgId,
      role:
        Array.isArray(token.orgs) && token.orgs.length
          ? token.orgs.find((o: any) => o.orgId === orgId)?.role || token.role
          : token.role,
    };

    // 5) Re-encode the JWT
    const jwt = await encode({ token: newToken, secret: NEXTAUTH_SECRET });

    // 6) Set new cookie
    const cookie = serialize(TOKEN_COOKIE_NAME, jwt!, {
      maxAge: 60 * 60,
      expires: new Date(Date.now() + 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
    res.setHeader("Set-Cookie", cookie);

    // 7) Respond
    return res.status(200).json({ ok: true, activeOrgId: orgId });
  } catch (err: any) {
    console.error("[switch-account] error:", err);
    const status = err.response?.status || 500;
    const message = err.response?.data?.message || err.message || "Internal error";
    return res.status(status).json({ message });
  }
}
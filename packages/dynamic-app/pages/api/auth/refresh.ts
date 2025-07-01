import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This will invoke NextAuth’s session logic & jwt callback
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  // On success, NextAuth has reset the session cookie for another maxAge window.
  res.status(200).json({ ok: true, expires: session.expires });
}
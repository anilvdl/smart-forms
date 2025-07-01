import jwtDecode from "jwt-decode";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  try {
    const session = await getSession({ req });
    
    if (!session?.user) {
      return res.status(401).json({ error: { message: "Not authenticated" } });
    } 

    // Grab the JWT session (or null if none)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const API_KEY      = process.env.AUTH_SERVICE_KEY!;

    // Clone and augment headers
    const requestHeaders = new Headers(
      Object.entries(req.headers).reduce<Record<string, string>>((acc, [key, value]) => {
        if (typeof value === "string") {
          acc[key] = value;
        } else if (Array.isArray(value)) {
          acc[key] = value.join(", ");
        }
        return acc;
      }, {})
    );
    if (token) {
      const jwtToken = token.jwtToken as string;
      const claims = jwtDecode<Record<string, any>>(jwtToken);
      let { sub: id, email, role, orgs, activeOrgId } = token as any;
      email = claims.email;
      const userPayload = JSON.stringify({ id, email, role, orgs, activeOrgId });
      const encoded = Buffer.from(userPayload).toString("base64");
      requestHeaders.set("x-user-info", encoded);
      requestHeaders.set('x-api-key', API_KEY); // Add API key to headers
      requestHeaders.set('Authorization',  `Bearer ${jwtToken}`); // Add JWT token to headers  
    }

    // Check if user has completed onboarding by checking if they have a billing plan
    const response = await fetch(
      `${process.env.AUTH_SERVICE_URL}/admin/user-orgs/${session.user.id}/billing-status`,
      {
        headers: requestHeaders
      }
    );

    if (!response.ok) {
      // If we can't get billing status, check if they have an organization with a plan
      const orgs = session.user.orgs || [];
      const hasOrganization = orgs.length > 0;
      
      const userStatus = {
        isNewUser: !hasOrganization,
        needsOnboarding: !hasOrganization || session.user.needsOnboarding || false,
        hasCompletedOnboarding: hasOrganization && !session.user.needsOnboarding
      };
      return res.json(userStatus);
    }

    const billingData = await response.json();
    
    // User is new if they don't have a billing plan set (still on initial FREE plan without selection)
    const isNewUser = !billingData.hasBillingPlan || billingData.needsOnboarding;

    const resultObj = {
      isNewUser,
      needsOnboarding: isNewUser,
      hasCompletedOnboarding: !isNewUser,
      billingPlan: billingData.plan || null
    };
    res.json(resultObj);

  } catch (error) {
    console.error("Error checking user status:", error);
    res.status(500).json({ 
      error: { 
        message: "Failed to check user status" 
      } 
    });
  }
}
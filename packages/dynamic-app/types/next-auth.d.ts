import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      orgs: Array<{ orgId: string; role: string }>;
      activeOrgId: string | null;
      role: string | null;
      needsOnboarding: boolean;
      needsEmailVerification: boolean;
      emailVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken?: string;
    jwtToken?: string;
    orgs?: Array<{ orgId: string; role: string }>;
    activeOrgId?: string | null;
    role?: string | null;
    needsOnboarding?: boolean;
    needsEmailVerification?: boolean;
    emailVerified?: boolean;
  }
}
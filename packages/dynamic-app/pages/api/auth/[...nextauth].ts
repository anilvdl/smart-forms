import NextAuth, { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { HttpAdapter } from "./httpAdapter";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;
if (!NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET in .env");
}

async function fetchUserOrgsFromBackend(userId: string) {
  const url = `${process.env.AUTH_SERVICE_URL}/admin/internal-user-orgs/${userId}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'x-api-key': process.env.AUTH_SERVICE_KEY!,
      }
    });
    if (!res.ok) {
      console.error(`Failed to fetch user-orgs: ${res.status}`);
      return { defaultOrgId: null, orgs: [] };
    }
    return await res.json() as {
      defaultOrgId?: string;
      orgs: Array<{ orgId: string; role: string }>;
    };
  } catch (error) {
    console.error("Error fetching user-orgs:", error);
    return { defaultOrgId: null, orgs: [] };
  }
}

async function checkBillingStatus(orgId: string, userId: string) {
  try {
    const billingResponse = await fetch(
      `${process.env.AUTH_SERVICE_URL}/admin/internal-user-orgs/${userId}/billing-status`,
      {
        headers: {
          'x-api-key': process.env.AUTH_SERVICE_KEY!,
        }
      }
    );
    
    if (billingResponse.ok) {
      const billingData = await billingResponse.json();
      return billingData.needsOnboarding || false;
    }
    return false;
  } catch (e) {
    console.error("Error checking billing status:", e);
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: HttpAdapter({
    baseUrl: process.env.AUTH_SERVICE_URL!,
    apiKey: process.env.AUTH_SERVICE_KEY!,
  }),
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        try {
          const response = await fetch(`${process.env.AUTH_SERVICE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.AUTH_SERVICE_KEY!,
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          
          if (!response.ok) {
            return null;
          }
          
          const user = await response.json();
          return user;
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, trigger, session, profile }) {
      // Initial sign in
      if (account && user) {
        token.accessToken = account.access_token;
        token.jwtToken = account.id_token;
        token.id = user.id;
        token.email = user.email || profile?.email;
        token.name = user.name;
        
        // Initialize flags
        token.emailVerified = false;
        token.needsEmailVerification = false;
        token.needsOnboarding = false;
        
        // Handle different auth providers
        if (account.provider === 'credentials') {
          // For credentials provider, check email verification
          try {
            const userResponse = await fetch(
              `${process.env.AUTH_SERVICE_URL}/auth/users/${user.id}`,
              {
                headers: {
                  'x-api-key': process.env.AUTH_SERVICE_KEY!,
                }
              }
            );
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              token.emailVerified = !!userData.email_verified;
              token.needsEmailVerification = !userData.email_verified;
            }
          } catch (e) {
            console.error("Error checking email verification:", e);
          }
        } else {
          // Social auth - emails are pre-verified
          token.emailVerified = true;
          token.needsEmailVerification = false;
        }
        
        // Fetch user organizations
        try {
          const { defaultOrgId, orgs } = await fetchUserOrgsFromBackend(token.id as string);
          token.orgs = orgs;
          token.activeOrgId = defaultOrgId || orgs[0]?.orgId || null;
          token.role = orgs.find(o => o.orgId === token.activeOrgId)?.role || null;
          
          // Check if user needs onboarding
          if (!orgs || orgs.length === 0) {
            // New user - needs to create organization
            if (account.provider !== 'credentials') {
              // For social auth, create organization
              try {
                const socialSignupResponse = await fetch(
                  `${process.env.AUTH_SERVICE_URL}/auth/social-signup`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-api-key': process.env.AUTH_SERVICE_KEY!,
                    },
                    body: JSON.stringify({
                      userId: user.id,
                      name: user.name || 'User',
                      email: token.email,
                      provider: account.provider,
                    }),
                  }
                );
                
                if (socialSignupResponse.ok) {
                  const signupData = await socialSignupResponse.json();
                  // Social signup creates a FREE org, so user needs onboarding to select plan
                  token.needsOnboarding = true;
                  token.activeOrgId = signupData.organizationId;
                  
                  // Re-fetch orgs to get updated data
                  const { orgs: updatedOrgs } = await fetchUserOrgsFromBackend(token.id as string);
                  token.orgs = updatedOrgs;
                  token.role = 'OWNER';
                }
              } catch (e) {
                console.error("Error in social signup:", e);
                token.needsOnboarding = true;
              }
            } else {
              // Credentials user without org
              token.needsOnboarding = true;
            }
          } else {
            // Existing user with organization - check if they need onboarding
            const needsOnboarding = await checkBillingStatus(token.activeOrgId as string, token.id as string);
            token.needsOnboarding = needsOnboarding;
          }
        } catch (e) {
          console.error("Error loading user-orgs:", e);
          token.orgs = [];
          token.activeOrgId = null;
          token.needsOnboarding = true;
        }
      }
      
      // Handle session updates
      if (trigger === "update" && session) {
        if (session.activeOrgId !== undefined) {
          token.activeOrgId = session.activeOrgId;
          token.role = (token.orgs as Array<{ orgId: string; role: string }>)
            ?.find(o => o.orgId === session.activeOrgId)?.role || null;
        }
        
        if (session.onboardingComplete === true || session.needsOnboarding === false) {
          token.needsOnboarding = false;
        }
        
        if (session.emailVerified === true) {
          token.emailVerified = true;
          token.needsEmailVerification = false;
        }
      }
      
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
       // expose token expiry timestamp to the client
      session.expires = token.exp?.toString() || session.expires;
      
      const user = {
        ...session.user!,
        id: token.id as string,
        orgs: (token.orgs as Array<{ orgId: string; role: string }>) || [],
        activeOrgId: (token.activeOrgId as string) || null,
        role: ((token.orgs as Array<{ orgId: string; role: string }>) || [])
          .find(o => o.orgId === token.activeOrgId)?.role || null,
        needsOnboarding: token.needsOnboarding === true,
        needsEmailVerification: token.needsEmailVerification === true,
        emailVerified: token.emailVerified === true,
      };
      return { ...session, user };
    },

    async signIn({ user, account }) {
      // Allow only configured providers
      const allowedProviders = ["google", "credentials"];
      if (!account || !allowedProviders.includes(account.provider)) {
        return false;
      }
      
      // For credentials provider, don't allow sign in if email not verified
      // This is handled in the authorize callback, but double-check here
      if (account.provider === "credentials" && user) {
        // Additional validation can be added here if needed
      }
      
      return true;
    },

    async redirect({ url, baseUrl }) {
      // Ensure the URL is absolute
      const urlObj = new URL(url, baseUrl);
      
      // Security: Only allow redirects to our domain
      if (!urlObj.href.startsWith(baseUrl)) {
        return baseUrl + "/dashboard";
      }
      
      // Allow specific auth paths
      const allowedPaths = [
        '/auth/social-callback',
        '/auth/verify-email',
        '/auth/email-verified',
        '/onboarding',
        '/dashboard',
        '/login',
        '/register'
      ];
      
      const isAllowedPath = allowedPaths.some(path => urlObj.pathname.startsWith(path));
      
      if (isAllowedPath) {
        return urlObj.href;
      }
      
      // Default redirect to dashboard
      return baseUrl + "/dashboard";
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 900, // 15 minutes
    updateAge: 300, // 5 minutes
  },

  jwt: {
    maxAge: 900, // 15 minutes, same as session
  },

  secret: NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
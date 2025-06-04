import NextAuth, { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { HttpAdapter } from "./httpAdapter";
// import { sign, verify } from "jsonwebtoken";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
if (!NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET in .env"); 
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
          prompt:      "select_account",
          access_type: "offline",
          response_type: "code",
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
        },
      };
    },
    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.jwtToken = account.id_token;
        token.id = user?.id;
      }
      return token;
    },
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        return true;
      }
      return false;
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback", { url, baseUrl });
      return url.startsWith(baseUrl) ? url : "/dashboard";
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login", // a dialog will show error message
  },
  session: {
    strategy: "jwt",
    maxAge: 1 * 1 * 60 * 60, // 1 hour
  },
  // Override the default JWE-based flow
  // jwt: {
  //   // On encode, produce a plain JWS
  //   encode: async ({ token, secret = NEXTAUTH_SECRET, maxAge }) => {
  //     if (!token) {
  //       throw new Error("Token is undefined");
  //     }
  //     const { iat, exp, ...payload } = token;
  //     return sign(payload, secret, {
  //       algorithm: "HS256",
  //       expiresIn: maxAge,
  //     });
  //   },
  //   // On decode, verify the signature
  //   decode: async ({ token, secret = NEXTAUTH_SECRET }) => {
  //     try {
  //       return verify(token!, secret, { algorithms: ["HS256"] }) as JWT;
  //     } catch {
  //       return null;
  //     }
  //   },
  // },
  debug: false,
};

export default NextAuth(authOptions);
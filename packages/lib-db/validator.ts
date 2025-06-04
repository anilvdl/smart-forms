import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  emailVerified: z.date().nullable(),
  image: z.string().url().nullable(),
  tier: z.string().optional(),
});

export const sessionSchema = z.object({
  sessionToken: z.string(),
  userId: z.string().uuid(),
  expires: z.date()
});

export const accountSchema = z.object({
  userId: z.string().uuid(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().optional(),
  access_token: z.string().optional(),
  expires_at: z.number().optional(),
  token_type: z.string().optional(),
  scope: z.string().optional(),
  id_token: z.string().optional(),
  session_state: z.string().optional(),
});

export const verificationTokenSchema = z.object({
  identifier: z.string(),
  token: z.string(),
  expires: z.date()
});

export function validateUser(data: any) {
  return userSchema.parse(data);
}

export function validateSession(data: any) {
  return sessionSchema.parse(data);
}

export function validateAccount(data: any) {
  return accountSchema.parse(data);
}

export function validateVerificationToken(data: any) {
  return verificationTokenSchema.parse(data);
}
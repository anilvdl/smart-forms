export type SmartUser = {
  id: string;
  email: string;
  name: string;
  emailVerified?: Date | null;
  image?: string | null;
  tier?: string;
};
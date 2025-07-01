import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

// Input validation schema
const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(10, "Password must be at least 10 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain number")
    .optional()
    .or(z.literal("")),
  companyName: z.string().optional(),
  inviteToken: z.string().optional(),
  captchaToken: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  try {
    // Validate input
    const validatedData = RegisterSchema.parse(req.body);
    
    // Verify CAPTCHA
    if (process.env.RECAPTCHA_SECRET_KEY) {
      const captchaResponse = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${validatedData.captchaToken}`,
        { method: "POST" }
      );
      const captchaData = await captchaResponse.json();
      
      if (!captchaData.success) {
        return res.status(400).json({ error: { message: "Invalid CAPTCHA" } });
      }
    }

    const payload = JSON.stringify({
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData?.password,
        companyName: validatedData?.companyName,
        inviteToken: validatedData?.inviteToken,
    });
    // Call backend service to create user
    const response = await fetch(`${process.env.AUTH_SERVICE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.AUTH_SERVICE_KEY!,
      },
      body: payload,
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(201).json({
      ...data,
      emailSent: true,
      message: 'Registration successful! Please check your email to verify your account.',
    });
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: { 
          message: "Validation failed", 
          details: error.errors 
        } 
      });
    }
    
    res.status(500).json({ 
      error: { 
        message: "Registration failed. Please try again." 
      } 
    });
  }
}

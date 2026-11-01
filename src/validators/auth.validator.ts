import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.email().trim().toLowerCase().max(255),
  password: z.string().min(10).max(100),
});

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(100),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(40).max(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

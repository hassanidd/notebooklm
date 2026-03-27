import { z } from "zod";

export const userSchema = z.object({
  id: z.cuid(),
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  image: z.url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const signupSchema = userSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signinSchema = userSchema.pick({
  email: true,
  password: true,
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

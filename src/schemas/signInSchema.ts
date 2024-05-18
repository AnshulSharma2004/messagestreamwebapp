import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
});

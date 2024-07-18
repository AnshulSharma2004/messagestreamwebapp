import { z } from "zod";

export const usernameValidation = z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")

export const signUpSchema = z.object({
    username:usernameValidation,
    email:z.string().email("Invalid email"),
    password:z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
    

})
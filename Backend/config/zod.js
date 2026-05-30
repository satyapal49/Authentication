import { z } from 'zod'

// Validation schemas using Zod. These help ensure incoming request bodies
// have the expected shape and provide helpful error messages for clients.
export const registerSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 character long"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "password must be atleast 8 characters long")
});


export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "password must be atleast 8 characters long")
});

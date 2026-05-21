import {email, z} from 'zod'

export const registerSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 character long"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "password must be atleast 8 characters long")
});
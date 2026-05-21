import { registerSchema } from '../config/zod.js';
import TryCatch from '../middlewares/tryCatch.js';
import sanitize from 'mongo-sanitize';

export const registerUser = TryCatch(async(req, res)=>{
    const sanitizeBody = sanitize(req.body);
    const validation = registerSchema.safeParse(sanitizeBody);

    if(!validation.success){
        return res.status(400).json({
            message: "Validation error",
        })
    }

    const {name, email, password} = validation.data;
    res.json({
        name,
        email,
        password,
    })
})
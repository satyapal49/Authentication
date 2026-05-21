import { ZodError } from 'zod';
import { registerSchema } from '../config/zod.js';
import TryCatch from '../middlewares/tryCatch.js';
import sanitize from 'mongo-sanitize';

export const registerUser = TryCatch(async(req, res)=>{
    const sanitizeBody = sanitize(req.body);
    const validation = registerSchema.safeParse(sanitizeBody);

    if(!validation.success){
        let zoderror = validation.error;
        let firstErrorMessage = "Validation error";
        let allError = [];

        if(zoderror?.issues && Array.isArray(zoderror.issues)){
            allError = zoderror.issues.map((issue)=>({
                field: issue.path ? issue.path.join(".") : "unknown",
                    message: issue.message || "Validation Error",
                    code: issue.code, 
            }));

            firstErrorMessage = allError[0]?.message || "Validation Error";
            
        }

        return res.status(400).json({
            message: firstErrorMessage,
            error: allError,
        });
    }

    const {name, email, password} = validation.data;
    res.json({
        name,
        email,
        password,
    })
})
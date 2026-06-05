import rateLimit from "express-rate-limit";

export const complaintLimiter = rateLimit(
    {
        windowMs:60*60*1000,
        max:5,
        standardHeaders:true,
        legacyHeaders:false,
        message:{
            success:false,
            code:"RATE_LIMIT_EXCEEDED",
            message:" Too many attempts "
        }
    }
)
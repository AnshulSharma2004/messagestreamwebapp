import { z } from "zod";

export const messageSchema = z.object({
    content:z.string().min(5,{
        message:"message must be at least 5 characters"
    }).max(1000,{
        message:"message must be at most 1000 characters"
    })

})
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import {usernameValidation} from "@/schemas/signUpSchema";
import {z} from "zod";

const userNameQuerySchema = z.object({
    username:usernameValidation
})

export async function GET(request: Request) {
    await dbConnect()
    try {
        const {searchParams} = new URL(request.url)   
        const queryParams = {
            username:searchParams.get('username')
        }
        const res = userNameQuerySchema.safeParse(queryParams)
        console.log(res);
        if(!res.success) {
            const usernameErrors = res.error.format().username?._errors || []
            return Response.json({
                success:false,
                message:usernameErrors.length > 0 ? usernameErrors.join(', ') : "invalid query parameter"
            }, {status:500})
        }

        const user = await UserModel.findOne({username:res.data.username, isVerified:true})
        if(user) {
            return Response.json({
                success:false,
                message:"Username already exists"
            }, {status:409})
        }
        return Response.json({
            success:true,
            message:"Username is available"
        }, {status:200})

    } catch (error) {
        console.log("Error in checking username", error);
        return Response.json(
            {
                success:false,
                message:"Error in checking username"
            }, {status:500}
        )
    }
}
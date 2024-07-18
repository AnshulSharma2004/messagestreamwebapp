import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function POST(request: Request) {
    await dbConnect()
    try {
        const {username, otp} = await request.json()
        const decodedUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({username:decodedUsername})
        if(!user) {
            return Response.json({
                success:false,
                message:"User not found"
            }, {status:404})
        }
        const isOtpCorrect = user.verifyCode === otp
        const isOtpValid = new Date(user.verifyCodeExpiry) > new Date()

        if(isOtpCorrect && isOtpValid) {
            user.isVerified = true;
            await user.save()
            return Response.json({
                success:true,
                message:"User verified successfully"
            }, {status:200})
        } else {
            return Response.json({
                success:false,
                message:"Invalid otp"
            }, {status:400})
        }
    } catch (error) {
        console.log('Error in verifying otp');
        return Response.json({
            success:false,
            message:"Error in verifying otp"
        }, {status:500})
    
    }
}
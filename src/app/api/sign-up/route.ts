import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs"
import otpGenerator from "otp-generator"

export async function POST (request:Request) {
    await dbConnect()

    try {
        const {username, email, password} = await request.json();
        const existingUserVerifiedByName = await UserModel.findOne({
            username:username,
            isVerified:true
        })

        if(existingUserVerifiedByName) {
            return Response.json({
                success: false,
                message: "Username already exists"
            })
        }

        const userByEmail = await UserModel.findOne({email})
        const verifyCode =   otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            specialChars:false,
            lowerCaseAlphabets:false
        })
        if(userByEmail) {
            if(userByEmail.isVerified) {
                return Response.json({
                    success:false,
                    message:"Email already exists"
                })
            }
            const hashedPassword = await bcrypt.hash(password, 10)


            const verifyCodeExpiry = new Date(Date.now() + 3600000)
            userByEmail.verifyCode = verifyCode
            userByEmail.verifyCodeExpiry = verifyCodeExpiry
            userByEmail.password = hashedPassword
            await userByEmail.save()
        } else {
            const hashedPassword = await bcrypt.hash(password, 10)


            const verifyCodeExpiry = new Date(Date.now() + 3600000)

            const newUser = new UserModel({
                username,
                email,
                password:hashedPassword,
                verifyCode,
                verifyCodeExpiry,
                messages:[],
                isVerified:false,
                isAcceptingMessage:true
            })
            await newUser.save()
        }

        const emailResponse = await sendVerificationEmail(email, username, verifyCode)
        if(!emailResponse.success) {
            return Response.json({
                success:false,
                message:emailResponse.message
            },{status:500})
        }

        return Response.json({
            success:true,
            message:"User created successfully"
        },{status:200})
    } catch (error) {
        console.log("Error in sign-up route");
        return Response.json({
            success:false,
            message:error
        },{status:500})
    }
}
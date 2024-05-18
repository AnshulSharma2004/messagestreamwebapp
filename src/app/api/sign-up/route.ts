import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/User";
import bcrypt from "bcryptjs"
import otpGenerator from "otp-generator"

export async function POST (request:Request) {
    dbConnect()

    try {
        const {username, email, password} = await request.json();
        const user = await userModel.findOne({email:email});

        const hashedPassword = await bcrypt.hash(password, 10);

        const verifyCode = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          specialChars: false,
        });

        if(user) {
            if(user.isVerified) {
                return Response.json({
                    success:false,
                    message:"User already verified"
                },{status:400})
            }
            else {

                user.password = hashedPassword;
                user.verifyCode = verifyCode;
                user.verifyCodeExpiry = new Date(Date.now() + 3600000);

                await user.save();

            }
        }
        else {
            const newUser = new userModel({
                username:username,
                email:email,
                password:hashedPassword,
                isVerified:false,
                messages:[],
                verifyCodeExpiry:new Date(Date.now() + 3600000),
                verifyCode:verifyCode
            })

            await newUser.save()
        }

        const emailResponse = await sendVerificationEmail(
          email,
          username,
          verifyCode
        );

        if (!emailResponse.success) {
          return Response.json(
            {
              success: false,
              message: emailResponse.message,
            },
            { status: 500 }
          );
        }

        return Response.json(
          {
            success: true,
            message: "User created successfully",
          },
          { status: 201 }
        );

    } catch (error) {
        console.log("Error in sign-up route");
        return Response.json({
            success:false,
            message:error
        },{status:500})
    }
}
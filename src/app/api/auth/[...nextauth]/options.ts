import NextAuth, {NextAuthOptions} from "next-auth";
import  {CredentialsProvider} from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import UserModel from "@/models/User";

export const authOptions:NextAuthOptions = {
    providers:[
        CredentialsProvider({
            id:"credentials",
            name:"Credentials",
            credentials:{
                email:{
                    label:"Email",
                    type:"email",
                    placeholder:"Enter your email"
                },
                password:{
                    label:"Password",
                    type:"password",
                    placeholder:"Enter your password"
                }
            },
            async authorize(credentials:any):Promise<any>{
                await dbConnect()
                try {
                    const user = await UserModel.findOne({
                        $or:[
                            {email:credentials.identifiers},
                            {password:credentials.password}
                        ]
                    })
                    if(!user) {
                        throw new Error("User not found")
                    }
                    if(!user.isVerified) {
                        throw new Error("Please verify before login")
                    }
                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
                    if(!isPasswordValid) {
                        throw new Error("Invalid password")
                    }
                    return user
                } catch (err:any) {
                    throw new Error(err.messages)
                }
            }
        })
    ],
    pages:{
        signIn:'/sign-in'
    },
    callbacks:{
        async jwt({token, user}) {
            if(user) {
                token._id = user._id?.toString()
                token.isVerified = user.isVerified
                token.username = user.username
                token.isAcceptingMessages = user.isAcceptingMessages

            }
            return token
        },
        async session({session, token}) {
            if(token) {
                session.user._id = token._id
                session.user.username = token.username
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
            }

            return session
        }
    },
    session:{
        strategy:"jwt"
    },
    secret:process.env.NEXTAUTH_SECRET
}
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"; // For verifying user during signin
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

// Configure and export NextAuth options to user in options.ts
export const authOptions: NextAuthOptions = {
    // Configure providers
    providers: [
        CredentialsProvider({
            id: "Credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: any): Promise<any> {
                // TODO: Basic guard

                // Connect to database
                await dbConnect();

                try {
                    // Find user by email or username
                    const user = await UserModel.findOne({
                        // $or syntax comes from MongoDB
                        $or: [
                            { email: credentials.identifier.email },
                            { username: credentials.identifier.username },
                        ],
                    });

                    // If user is not found throw error to client
                    if (!user) {
                        throw new Error("No user found."); // This tells nextauth “Stop, something failed.”
                    }

                    // If user is found but not verified, throw verification error to client
                    if (!user.isVerified) {
                        throw new Error(
                            "Please verify your account before logging in."
                        );
                    }

                    // If a verified user is found then compare password
                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password
                    ); // No identifier because of inconsistency in docs syntax

                    // If password is correct return user else throw error
                    if (isPasswordCorrect) {
                        return user;
                    } else {
                        throw new Error("Invalid credentials.");
                    }
                } catch (err: any) {
                    throw new Error(err);
                }
            },
        }),
    ],
    // Configure callbacks
    callbacks: {
        async jwt({ token, user }) {
            // Modifying token to include user information (To reduce db calls)
            if (user) {
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }

            return token;
        },
        async session({ session, token }) {
            // Modifying session to include token information (To reduce db calls)
            if (token) {
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }

            return session;
        },
    },
    // Configure pages
    pages: {
        signIn: "/sign-in", // Override default /auth/signin to use /sign-in
    },
    // Configure session
    session: {
        strategy: "jwt", // Use JWT for session management
    },
    // Configure secret
    secret: process.env.NEXTAUTH_SECRET,
};

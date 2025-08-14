// Database connection in nextjs is requires in each route
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { success } from "zod";

export async function POST(request: Request) {
    await dbConnect();

    try {
        // Extract user details from the request body
        const { username, email, password } = await request.json();

        // Check if a user already exists with this username and is verified
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true,
        });

        // In that case send a response indicating the username is taken
        if (existingUserVerifiedByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username is already taken",
                },
                { status: 400 }
            );
        }

        // If no user is found with the given username, check if a user already exists with this email
        const existingUserByEmail = await UserModel.findOne({
            email,
            isVerified: true,
        });

        // Generate a verification code
        const verifyCode = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // If a user already exists with this email
        if (existingUserByEmail) {
            // If the user is verified then return
            if (existingUserByEmail.isVerified) {
                return Response.json(
                    {
                        success: false,
                        message: "User already exists with this email",
                    },
                    { status: 400 }
                );
            } else {
                // If the user is not verified then update the user with new password

                // Hash and update the new password
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;

                // Update the verification code and expiry
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(
                    Date.now() + 3600000
                ); // Set expiry time to 1 hour from now

                // Save the updated user
                await existingUserByEmail.save();
            }
        } else {
            // If no user is found with the given email, create a new user

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Define email verification token expiry
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry time to 1 hour from now
            // The setHours() method modifies the Date object in place and returns the new timestamp of the updated Date object.

            // Create a new user
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false, // Initially set to false
                isAcceptingMessages: true, // Initially set to true
                messages: [],
            });

            // Save the new user to the database
            await newUser.save();
        }

        // Send a verification email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        );

        // If the email sending fails
        if (!emailResponse.success) {
            return Response.json(
                {
                    success: false,
                    message: emailResponse.message,
                },
                { status: 500 }
            );
        }

        // If the email sending is successful
        return Response.json(
            {
                success: true,
                message:
                    "User registered successfully. Please check your email to verify your account.",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error registering user:", error);

        return Response.json(
            {
                success: false,
                message: "Error registering user",
            },
            { status: 500 }
        );
    }
}

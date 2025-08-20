import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";

// Toggle user message acceptance status
export async function POST(request: Request) {
    await dbConnect();

    // Get user session (next-auth)
    const session = await getServerSession(authOptions);

    // Get user from session
    const user: User = session?.user as User;

    // If session or user is not found return unauthorized
    if (!session || !user) {
        return Response.json(
            {
                success: false,
                message: "Unauthorized",
            },
            { status: 401 }
        );
    }

    // Extract user ID from user
    const userId = user._id;

    // Get acceptance status from request
    const { acceptMessages } = await request.json();

    // Update user acceptance status
    // Database work will go in try-catch block
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessage: acceptMessages },
            { new: true } // We will get the updated user document in the response
        );

        if (!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Failed to update user status to accept messages",
                },
                { status: 401 }
            );
        } else {
            return Response.json(
                {
                    success: true,
                    message: "Message acceptance status updated successfully",
                    updatedUser,
                },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error("Failed to update user status to accept messages");

        return Response.json(
            {
                success: false,
                message: "Failed to update user status to accept messages",
            },
            { status: 500 }
        );
    }
}

// Fetch user message acceptance status
export async function GET(request: Request) {
    await dbConnect();

    // Get user session (next-auth)
    const session = await getServerSession(authOptions);

    // Get user from session
    const user: User = session?.user as User;

    // If session or user is not found return unauthorized
    if (!session || !user) {
        return Response.json(
            {
                success: false,
                message: "Unauthorized",
            },
            { status: 401 }
        );
    }

    // Extract user ID from user
    const userId = user._id;

    // Fetch user acceptance status from database
    try {
        const foundUser = await UserModel.findById(userId);

        if (!foundUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }
        return Response.json(
            {
                success: true,
                isAcceptingMessages: foundUser.isAcceptingMessage,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in getting message acceptance status");

        return Response.json(
            {
                success: false,
                message: "Error in getting message acceptance status",
            },
            { status: 500 }
        );
    }
}

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { Message } from "@/models/User";

export async function POST(request: Request) {
    await dbConnect();

    // Anyone can send anonymous messages in this application without the need of an account
    // But to receive messages, users must have an account

    // Extract username (recipient) and content from request body
    const { username, content } = await request.json();

    try {
        // Find user by username
        const user = await UserModel.findOne({ username });

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        // If user is found, check if user is accepting the messages.
        if (!user.isAcceptingMessage) {
            return Response.json(
                {
                    success: false,
                    message: "User is not accepting messages",
                },
                { status: 403 }
            );
        }

        // Create new message
        const newMessage = { content, createdAt: new Date() };

        // Push new message to user's messages array
        user.messages.push(newMessage as Message); // Assert type

        // Save user with new message
        await user.save();

        // Return success response
        return Response.json(
            {
                success: true,
                message: "Message sent successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.log("Error adding message:", error);

        return Response.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}

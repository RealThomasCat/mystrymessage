import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";

export async function DELETE(
    request: Request,
    { params }: { params: { messageid: string } }
) {
    // Get message id from params
    const messageId = params.messageid;

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

    try {
        // Update user's messages array
        const updatedResult = await UserModel.updateOne(
            // Find user by ID
            { _id: user._id },
            // The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
            // Remove the message with the specified ID from the user's messages array
            {
                $pull: {
                    messages: { _id: messageId },
                },
            }
        );

        // If no documents were modified, the message was not found
        if (updatedResult.modifiedCount === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Message not found or already deleted",
                },
                { status: 404 }
            );
        }

        // If the message was found and deleted successfully
        return Response.json(
            {
                success: true,
                message: "Message deleted successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting message:", error);
        return Response.json(
            {
                success: false,
                message: "Internal Server Error",
            },
            { status: 500 }
        );
    }
}

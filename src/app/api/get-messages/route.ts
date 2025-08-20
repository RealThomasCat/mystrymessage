import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";
import mongoose from "mongoose";

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

    // Convert user ID (string) to ObjectId
    // We are doing this here because we are going to use mongoDB aggregation pipelines
    // MongoDB expects an ObjectId when you run things like aggregation pipelines or $match queries
    // For “normal” Mongoose operations (find, update, delete via Model methods), a string id is fine (Mongoose query helpers)
    // Because mongoose runs its casting layer before sending the query to MongoDB
    // Aggregation runs on MongoDB, not via Mongoose’s query helpers. Mongoose does not reliably cast values inside an aggregation pipeline.
    const userId = new mongoose.Types.ObjectId(user.id);

    try {
        // Get user messages using mongoDB aggregation pipeline
        const user = await UserModel.aggregate([
            // First stage: Match user by ID
            { $match: { _id: userId } },
            // Second stage: Unwind messages array
            // Splits the array into multiple documents — one per message — and copies other fields (of user document) along
            { $unwind: "$messages" },
            // Third stage: Sort messages by createdAt field (newest messages first)
            { $sort: { "messages.createdAt": -1 } },
            // Fourth stage: Group messages back into an array
            // We group all those unwinded messages back by the original user _id, and push each messages doc into a new array (messages) in the sorted order we just established.
            { $group: { _id: "$_id", messages: { $push: "$messages" } } },
        ]);

        // NOTE: Aggregation pipeline returns an array of documents
        // If no documents match the query, it will return an empty array

        // If user is not found
        if (!user || user.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        // If user is found, return messages
        return Response.json(
            {
                success: true,
                messages: user[0].messages,
            },
            { status: 200 }
        );
    } catch (error) {}
}

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { success, z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

// Create query schema: This schema validates the query parameters (username) for this endpoint request.
const UsernameQuerySchema = z.object({
    username: usernameValidation,
});

export async function GET(request: Request) {
    // Connect to the database
    await dbConnect();

    try {
        // Request url example: localhost:3000/api/check-username-unique?username=yashveer...etc...

        // Get search parameters from the request URL
        const { searchParams } = new URL(request.url);

        // Get query parameters from the searchParams
        const queryParam = {
            username: searchParams.get("username"),
        };

        // Validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam);
        // console.log("Validation result:", result); // TODO: Remove this in production
        // // Output: Validation result: { success: true, data: { username: 'yashveer' } }

        // If validation fails, extract and return the username validation errors
        if (!result.success) {
            // const usernameErrors = result.error.format().username?._errors; // format is deprecated
            const usernameErrors =
                z.treeifyError(result.error).properties?.username?.errors || [];

            return Response.json(
                {
                    success: false,
                    message:
                        usernameErrors?.length > 0
                            ? usernameErrors
                            : "Invalid query parameters",
                },
                { status: 400 }
            );
        }

        // If validation is successful, we have to check if the username exists in the database
        // First extract username from the validated result
        const { username } = result.data;

        // Check if a verified user exists with the given username
        const existingVerifiedUser = await UserModel.findOne({
            username,
            isVerified: true,
        });

        // If a verified user exists with the given username, return a conflict response
        if (existingVerifiedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Username is already taken",
                },
                { status: 400 }
            );
        }

        // If no verified user exists with the given username, return a success response
        return Response.json(
            {
                success: true,
                message: "Username is available",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error checking username", error);

        return Response.json(
            {
                success: false,
                message: "Error checking username",
            },
            { status: 500 }
        );
    }
}

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { verifySchema } from "@/schemas/verifySchema";

export async function POST(request: Request) {
    await dbConnect();

    try {
        // Extract json from the request body
        const json = await request.json();

        // Validate the request body against the schema
        const result = verifySchema.safeParse(json);

        // If validation fails, return errors
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            return Response.json(
                { success: false, message: errors },
                { status: 400 }
            );
        }

        // Extract username and code from the validated data
        const { username, code } = result.data;

        // This method gets the unencoded version of the encoded component of a URI
        // Its not necessary to use this in our case because username is in request body and not in the URL
        const decodedUsername = decodeURIComponent(username);

        // Find user in DB
        const user = await UserModel.findOne({ username: decodedUsername });

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        // Check if verification code is valid and not expired
        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date(); // Expiry date should be in the future

        // If the code is valid and not expired, mark user as verified
        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();

            return Response.json(
                {
                    success: true,
                    message: "Account verified successfully",
                },
                { status: 200 }
            );
        } else if (!isCodeNotExpired) {
            // Handle expired verification code case
            return Response.json(
                {
                    success: false,
                    message:
                        "Verification code has expired, please sign up again to get a new code",
                },
                { status: 400 }
            );
        } else {
            // Handle incorrect verification code case
            return Response.json(
                {
                    success: false,
                    message: "Incorrect verification code",
                },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error verifying user", error);

        return Response.json(
            {
                success: false,
                message: "Error verifying user",
            },
            { status: 500 }
        );
    }
}

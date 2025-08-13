// Importing necessary modules from mongoose
import mongoose, { Schema, Document } from "mongoose";
// Imported Schema to avoid writing mongoose.Schema every time
// Imported Document because we are using TypeScript and want to define the type of the document

// First defining the Message type using interface
// extends Document is used to ensure that the interface has all the properties of a Mongoose document
export interface Message extends Document {
    content: string;
    createdAt: Date;
}

// Creating a Mongoose schema for the Message model
const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

// Defining the User type using interface
export interface User extends Document {
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified: boolean;
    isAcceptingMessage: boolean;
    messages: Message[];
}

// Creating a Mongoose schema for the User model
const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        match: [/.+\@.+\..+/, "Please use a valid email address"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    verifyCode: {
        type: String,
        required: [true, "Verification code is required"],
    },
    verifyCodeExpiry: {
        type: Date,
        required: [true, "Verification code expiry is required"],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isAcceptingMessage: {
        type: Boolean,
        default: true,
    },
    messages: [MessageSchema], // Embedding the Message schema
});

// Exporting the User model
// If the User model already exists (from a previous hot-reload), reuse it. If it doesn’t exist yet, create it from the schema.
// This prevents errors during development when the server is restarted.
const UserModel =
    (mongoose.models.User as mongoose.Model<User>) ||
    mongoose.model<User>("User", UserSchema);

export default UserModel;

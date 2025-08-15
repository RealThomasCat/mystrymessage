// This file contains custom TypeScript definitions for NextAuth to extend the default types.
// We are doing this because we want to add additional properties to the User, Session, and JWT interfaces (src\app\api\auth\[...nextauth]\options.ts).

// Import next-auth module
import "next-auth";
import { DefaultSession } from "next-auth";

// Extend the default NextAuth types
declare module "next-auth" {
    // Extend the User interface
    interface User {
        _id?: string;
        isVerified?: boolean;
        isAcceptingMessages?: boolean;
        username?: string;
    }
    // Extend the Session interface
    interface Session {
        user: {
            _id?: string;
            isVerified?: boolean;
            isAcceptingMessages?: boolean;
            username?: string;
        } & DefaultSession["user"]; // Include all properties from DefaultSession['user'] (Documentation)
    }
}

// Extend the JWT interface (Alternative syntax)
declare module "next-auth/jwt" {
    interface JWT {
        _id?: string;
        isVerified?: boolean;
        isAcceptingMessages?: boolean;
        username?: string;
    }
}

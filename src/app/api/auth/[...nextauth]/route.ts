import NextAuth from "next-auth";
import { authOptions } from "./options";

// Initialize NextAuth with a route handler by passing our options
const handler = NextAuth(authOptions);

// Export the handler for both GET and POST requests
export { handler as GET, handler as POST };

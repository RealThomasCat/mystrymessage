import { Message } from "@/models/User";

// Standardizing API response structure
export interface ApiResponse {
    success: boolean;
    message: string;
    isAcceptingMessage?: boolean; // Optional field
    messages?: Array<Message>; // Optional field
}

import { Resend } from "resend";

// Create a resend instance using the API key
export const resend = new Resend(process.env.RESEND_API_KEY);

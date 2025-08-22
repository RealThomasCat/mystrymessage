"use client";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { verifySchema } from "@/schemas/verifySchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const VerifyAccount = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get the router instance
    const router = useRouter();

    // Get the username from the URL parameters
    const params = useParams<{ username: string }>();

    // Zod implementation
    const form = useForm<z.infer<typeof verifySchema>>({
        // Use the Zod schema for validation
        resolver: zodResolver(verifySchema),
    });

    // Handle form submission
    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        setIsSubmitting(true);

        try {
            // Axios request to verify the code
            const response = await axios.post("/api/verify-code", {
                username: params.username,
                code: data.code,
            });

            // Show success toast
            toast.success("Success", { description: response.data.message });

            router.replace("/sign-in");
        } catch (error) {
            console.error("Error during verification:", error);

            // Handle axios error (optional)
            const axiosError = error as AxiosError<ApiResponse>;

            toast.error("Signup failed", {
                description: axiosError.response?.data.message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl mb-4">
                        Verify Your Account
                    </h1>
                    <p className="text-sm mb-4 text-gray-600">
                        Enter the verification code sent to your email.
                    </p>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <FormField
                            name="code"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Verification Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Verification Code"
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                    Please wait
                                </>
                            ) : (
                                "Verify"
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default VerifyAccount;

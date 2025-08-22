"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod"; // It imports everything that Zod exports (all its functions, classes, types) under the namespace z.
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const page = () => {
    const [username, setUsername] = useState("");
    const [usernameMessage, setUsernameMessage] = useState("");
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Debounce the username input
    // useDebounceCallback will introduce a delay in updating the username state
    const debounced = useDebounceCallback(setUsername, 300);

    // Get the router instance
    const router = useRouter();

    // Zod implementation
    const form = useForm<z.infer<typeof signUpSchema>>({
        // Use the Zod schema for validation
        resolver: zodResolver(signUpSchema),

        // Set default values for the form fields
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    });

    // Check username uniqueness on debounced value change
    useEffect(() => {
        // Function to check if the username is unique
        const checkUsernameUnique = async () => {
            if (username) {
                // Set loading state to true
                setIsCheckingUsername(true);
                // Reset username message to empty
                setUsernameMessage("");

                try {
                    // Send request using axios (send username (debounced) in the query parameter)
                    const response = await axios.get(
                        `/api/check-username-unique?username=${username}`
                    );

                    // Update username message with the response
                    setUsernameMessage(response.data.message);
                } catch (error) {
                    // Handle axios error (optional)
                    const axiosError = error as AxiosError<ApiResponse>;

                    setUsernameMessage(
                        axiosError.response?.data.message ??
                            "Error checking username uniqueness."
                    );
                } finally {
                    // Set loading state to false
                    setIsCheckingUsername(false);
                }
            }
        };

        // Call the function to check username uniqueness
        checkUsernameUnique();
    }, [username]);

    // Form submission handler
    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        // Set submitting loading state to true
        setIsSubmitting(true);

        try {
            // Send sign-up request
            const response = await axios.post<ApiResponse>(
                "/api/sign-up",
                data
            );

            // Show success toast
            toast.success("Success", { description: response.data.message });

            // Redirect to verify page with username
            router.replace(`/verify/${username}`);
        } catch (error) {
            console.error("Error during sign-up:", error);

            // Handle axios error (optional)
            const axiosError = error as AxiosError<ApiResponse>;

            let errorMessage = axiosError.response?.data.message;

            toast.error("Signup failed", { description: errorMessage });
        } finally {
            // Reset submit loading state
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl mb-4">
                        Join Mystery Message
                    </h1>
                    <p className="text-sm mb-4 text-gray-600">
                        Sign up to start your anonymous adventure
                    </p>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <FormField
                            name="username"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Username"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                debounced(e.target.value); // Because of custom debouncing implementation
                                            }}
                                        />
                                    </FormControl>
                                    {/* Show loading spinner while checking username */}
                                    {isCheckingUsername && (
                                        <Loader2 className="animate-spin" />
                                    )}{" "}
                                    <p
                                        className={`text-sm ${usernameMessage === "Username is available" ? "text-green-500" : "text-red-500"}`}
                                    >
                                        {usernameMessage}
                                    </p>
                                    {/* Removed form description */}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Email" {...field} />
                                    </FormControl>
                                    {/* Removed form description */}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Password"
                                            {...field}
                                        />
                                    </FormControl>
                                    {/* Removed form description */}
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
                                "Sign Up"
                            )}
                        </Button>
                    </form>
                </Form>

                <div className="text-center mt-4">
                    <p>
                        Already a member?{" "}
                        <Link
                            href="/sign-in"
                            className="text-blue-600 hover:text-blue-800"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default page;

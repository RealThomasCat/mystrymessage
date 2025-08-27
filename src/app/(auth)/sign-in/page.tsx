"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod"; // It imports everything that Zod exports (all its functions, classes, types) under the namespace z.
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { signInSchema } from "@/schemas/signInSchema";
import { signIn } from "next-auth/react";

const page = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get the router instance
    const router = useRouter();

    // Zod implementation
    const form = useForm<z.infer<typeof signInSchema>>({
        // Use the Zod schema for validation
        resolver: zodResolver(signInSchema),

        // Set default values for the form fields
        defaultValues: {
            identifier: "",
            password: "",
        },
    });

    // Form submission handler
    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        // Set submitting loading state to true
        setIsSubmitting(true);

        // Because we are using next-auth for sign-in
        const result = await signIn("credentials", {
            identifier: data.identifier,
            password: data.password,
            redirect: false,
        });

        // Handle the result
        if (result?.error) {
            toast.error("Login failed", { description: result.error });
        }

        // If sign in was successful (result?.url -> Docs)
        if (result?.url) {
            router.replace("/dashboard");
        }

        // Reset submitting state
        setIsSubmitting(false);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl mb-4">
                        Welcome Back!
                    </h1>
                    <p className="text-sm mb-4 text-gray-600">
                        Sign in to start your anonymous adventure
                    </p>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <FormField
                            name="identifier"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email or Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Email or Username"
                                            {...field}
                                        />
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
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </Form>

                <div className="text-center mt-4">
                    <p>
                        Don't have an account?{" "}
                        <Link
                            href="/sign-up"
                            className="text-blue-600 hover:text-blue-800"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default page;

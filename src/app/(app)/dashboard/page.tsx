"use client";

import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Message, User } from "@/models/User";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const page = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false); // Messages fetching loading state
    const [isSwitchLoading, setIsSwitchLoading] = useState(false); // Switch loading state

    // Handle message deletion
    // This function will filter out the deleted message from the state (Optimistic UI)
    const handleDeleteMessage = (messageId: string) => {
        setMessages(messages.filter((message) => message._id !== messageId));
    };

    // Get the current user's session
    const { data: session } = useSession();

    // Initialize the form using react-hook-form and Zod
    const form = useForm({
        resolver: zodResolver(acceptMessageSchema),
    });

    // Destructure form methods
    // register: This function will register an input field with the form
    // watch: This function will allow you to watch the value of a specific input field
    // setValue: This function will allow you to set the value of a specific input field
    const { register, watch, setValue } = form;

    // Get the value of the acceptMessages field
    const acceptMessages = watch("acceptMessages");

    // Fetch the accept messages
    const fetchAcceptMessages = useCallback(async () => {
        // Set switch loading state to true
        setIsSwitchLoading(true);

        try {
            // Fetch the isAcceptingMessages value
            const response = await axios.get<ApiResponse>(
                "/api/accept-messages"
            );

            // Set the value of the acceptMessages field to the fetched value
            setValue(
                "acceptMessages",
                response.data.isAcceptingMessage ?? false
            );
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;

            toast.error("Error", {
                description:
                    axiosError.response?.data.message ||
                    "Failed to fetch accept messages",
            });
        } finally {
            setIsSwitchLoading(false);
        }
    }, [setValue]);

    // Fetch messages
    const fetchMessages = useCallback(
        async (refresh: boolean = false) => {
            setIsLoading(true);
            setIsSwitchLoading(false);

            try {
                const response =
                    await axios.get<ApiResponse>("/api/get-messages");

                setMessages(response.data.messages || []);

                // If messages were refreshed
                if (refresh) {
                    toast("Refreshed messages", {
                        description: "Showing latest messages",
                    });
                }
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>;

                toast.error("Error", {
                    description:
                        axiosError.response?.data.message ||
                        "Failed to fetch messages",
                });
            } finally {
                setIsLoading(false);
                setIsSwitchLoading(false);
            }
        },
        [setIsLoading, setMessages]
    );

    // Fetch messages and accept messages when the session, set value (switch), and fetch functions change
    useEffect(() => {
        // If there is no session or user, return
        if (!session || !session.user) return;

        // Only if the user is logged in, fetch messages and accept messages
        fetchMessages();
        fetchAcceptMessages();
    }, [session, setValue, fetchAcceptMessages, fetchMessages]);

    // Handle switch change
    const handleSwitchChange = async () => {
        try {
            // Send a request to update the acceptMessages setting
            const response = await axios.post<ApiResponse>(
                "/api/accept-messages",
                { acceptMessages: !acceptMessages }
            );

            // Update the form value (UI)
            setValue("acceptMessages", !acceptMessages);

            toast.success("Successfully updated accept messages", {
                description: response.data.message,
            });
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;

            toast.error("Error", {
                description:
                    axiosError.response?.data.message ||
                    "Failed to update accept messages",
            });
        }
    };

    if (!session || !session.user)
        return <div>Please log in to access the dashboard</div>;

    // Extract username from session
    const { username } = session?.user as User;
    // Construct base URL
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    // Construct profile URL
    const profileUrl = `${baseUrl}/u/${username}`;

    // Function to copy profile URL to clipboard
    const copyToClipboard = () => {
        // Write the profile URL to the clipboard
        navigator.clipboard.writeText(profileUrl);

        toast.success("URL copied", {
            description: "Profile URL copied to clipboard",
        });
    };

    return (
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">
                    Copy Your Unique Link
                </h2>{" "}
                <div className="flex items-center">
                    <input
                        type="text"
                        value={profileUrl}
                        disabled
                        className="input input-bordered w-full p-2 mr-2"
                    />
                    <Button onClick={copyToClipboard}>Copy</Button>
                </div>
            </div>

            <div className="mb-4">
                <Switch
                    {...register("acceptMessages")}
                    checked={acceptMessages}
                    onCheckedChange={handleSwitchChange}
                    disabled={isSwitchLoading}
                />
                <span className="ml-2">
                    Accept Messages: {acceptMessages ? "On" : "Off"}
                </span>
            </div>
            <Separator />

            <Button
                className="mt-4"
                variant="outline"
                onClick={(e) => {
                    e.preventDefault();
                    fetchMessages(true);
                }}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <RefreshCcw className="h-4 w-4" />
                )}
            </Button>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.length > 0 ? (
                    messages.map((message, index) => (
                        <MessageCard
                            key={message._id}
                            message={message}
                            onMessageDelete={handleDeleteMessage}
                        />
                    ))
                ) : (
                    <p>No messages to display.</p>
                )}
            </div>
        </div>
    );
};

export default page;

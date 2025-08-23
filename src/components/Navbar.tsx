"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "./ui/button";

const Navbar = () => {
    // Extract session data
    const { data: session } = useSession();

    // Extract user information
    const user: User = session?.user as User;

    return (
        <nav className="p-4 md:p-6 shadow-md">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                <a className="text-xl font-semibold mb-4 md:mb-0" href="#">
                    Mystry Message
                </a>

                {session ? (
                    // If User is logged in
                    <>
                        <span className="mr-4">
                            Welcome, {user?.username || user?.email}
                        </span>

                        {/* Logout button */}
                        <Button
                            onClick={() => signOut()}
                            className="w-full md:w-auto"
                        >
                            Logout
                        </Button>
                    </>
                ) : (
                    <Link href="/signin">
                        <Button className="w-full md:w-auto">Login</Button>
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

"use client";

import { SessionProvider } from "next-auth/react";

// AuthProvider component: Provides the NextAuth session to its children
export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SessionProvider>{children}</SessionProvider>;
}

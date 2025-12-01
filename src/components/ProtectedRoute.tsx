"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@/types";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else if (allowedRoles && role && !allowedRoles.includes(role)) {
                // Redirect based on role if trying to access unauthorized page
                if (role === "client") router.push("/client");
                else if (role === "trader") router.push("/trading");
                else if (role === "admin" || role === "supervisor") router.push("/admin");
                else router.push("/");
            }
        }
    }
    }, [user, role, loading, router, allowedRoles]);

if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Ładowanie...</div>;
}

if (!user) return null;
if (allowedRoles && role && !allowedRoles.includes(role)) return null;

return <>{children}</>;
}

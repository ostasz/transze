"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Navbar() {
    const { user, role, logout } = useAuth();

    return (
        <nav className="bg-white shadow dark:bg-gray-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <div className="flex flex-shrink-0 items-center">
                            <Link href="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                Transze
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500 dark:text-gray-300">
                                    {user.email} ({role === "client" ? "Klient" : "Trading"})
                                </span>
                                <button
                                    onClick={logout}
                                    className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    Wyloguj
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                            >
                                Zaloguj
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

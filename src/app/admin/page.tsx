"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import { UserRole } from "@/types";

export default function AdminPage() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState<UserRole>("client");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [activationLink, setActivationLink] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setActivationLink("");

        try {
            const res = await fetch("/api/admin/create-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, name, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setMessage("Użytkownik utworzony pomyślnie!");
            setActivationLink(data.activationLink);
            setEmail("");
            setName("");
            setRole("client");
        } catch (error: any) {
            setMessage(`Błąd: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={["admin", "supervisor"]}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 max-w-2xl mx-auto">
                        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                            Panel Administratora - Dodaj Użytkownika
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Imię i Nazwisko (opcjonalnie)
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 p-2 border"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Adres Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 p-2 border"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Rola
                                </label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as UserRole)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 p-2 border"
                                >
                                    <option value="client">Klient</option>
                                    <option value="trader">Trader</option>
                                    <option value="admin">Admin</option>
                                </select>
                                {role === "trader" && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        * Trader musi mieć adres w domenie @ekovoltis.pl
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {loading ? "Tworzenie..." : "Utwórz użytkownika"}
                            </button>
                        </form>

                        {message && (
                            <div className={`mt-4 p-4 rounded-md ${message.startsWith("Błąd") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                                <p>{message}</p>
                                {activationLink && (
                                    <div className="mt-2">
                                        <p className="font-semibold">Link aktywacyjny (wyślij użytkownikowi):</p>
                                        <code className="block mt-1 p-2 bg-white rounded border text-xs break-all">
                                            {activationLink}
                                        </code>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}

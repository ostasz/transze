"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, query, onSnapshot, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Mandate } from "@/types";

export default function TradingPage() {
    const { user } = useAuth();
    const [mandates, setMandates] = useState<Mandate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, "mandates"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const mandatesData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Mandate[];
            setMandates(mandatesData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleStatusUpdate = async (mandateId: string, newStatus: "REALIZED" | "FAILED") => {
        try {
            const mandateRef = doc(db, "mandates", mandateId);
            await updateDoc(mandateRef, {
                status: newStatus,
            });
        } catch (error) {
            console.error("Error updating mandate: ", error);
            alert("Wystąpił błąd podczas aktualizacji statusu.");
        }
    };

    return (
        <ProtectedRoute allowedRoles={["trading"]}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                            Wszystkie mandaty (Trading Desk)
                        </h2>
                        {loading ? (
                            <p>Ładowanie...</p>
                        ) : mandates.length === 0 ? (
                            <p className="text-gray-500">Brak mandatów w systemie.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                                Klient
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                                Produkt
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                                Cena / Wolumen
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                                Akcje
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                        {mandates.map((mandate) => (
                                            <tr key={mandate.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {mandate.clientEmail}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {mandate.product} ({mandate.duration})
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {mandate.price} PLN | {mandate.volume} {mandate.volumeUnit}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${mandate.status === "REALIZED"
                                                                ? "bg-green-100 text-green-800"
                                                                : mandate.status === "FAILED"
                                                                    ? "bg-red-100 text-red-800"
                                                                    : "bg-yellow-100 text-yellow-800"
                                                            }`}
                                                    >
                                                        {mandate.status === "PENDING"
                                                            ? "Oczekujący"
                                                            : mandate.status === "REALIZED"
                                                                ? "Zrealizowany"
                                                                : "Niezrealizowany"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {mandate.status === "PENDING" && (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleStatusUpdate(mandate.id, "REALIZED")}
                                                                className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                                                            >
                                                                Zrealizuj
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(mandate.id, "FAILED")}
                                                                className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                                                            >
                                                                Odrzuć
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}

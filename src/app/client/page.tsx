"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { addDoc, collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Mandate, ProductType, VolumeUnit } from "@/types";

export default function ClientPage() {
    const { user } = useAuth();
    const [mandates, setMandates] = useState<Mandate[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [product, setProduct] = useState<ProductType>("BASE");
    const [price, setPrice] = useState("");
    const [volume, setVolume] = useState("");
    const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>("MW");
    const [duration, setDuration] = useState("");

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "mandates"),
            where("clientId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            await addDoc(collection(db, "mandates"), {
                clientId: user.uid,
                clientEmail: user.email,
                product,
                price: Number(price),
                volume: Number(volume),
                volumeUnit,
                duration,
                status: "PENDING",
                createdAt: new Date(),
            });

            // Reset form
            setPrice("");
            setVolume("");
            setDuration("");
            alert("Mandat został złożony!");
        } catch (error) {
            console.error("Error adding mandate: ", error);
            alert("Wystąpił błąd podczas składania mandatu.");
        }
    };

    return (
        <ProtectedRoute allowedRoles={["client"]}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Create Mandate Form */}
                        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                                Złóż nowy mandat
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Produkt
                                    </label>
                                    <select
                                        value={product}
                                        onChange={(e) => setProduct(e.target.value as ProductType)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <option value="BASE">BASE</option>
                                        <option value="PEAK">PEAK</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Cena (PLN/MWh)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 p-2 border"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Wolumen
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={volume}
                                            onChange={(e) => setVolume(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 p-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Jednostka
                                        </label>
                                        <select
                                            value={volumeUnit}
                                            onChange={(e) => setVolumeUnit(e.target.value as VolumeUnit)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                        >
                                            <option value="MW">MW</option>
                                            <option value="%">%</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Czas trwania (np. Q1 2026)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 p-2 border"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Złóż zlecenie
                                </button>
                            </form>
                        </div>

                        {/* Mandates List */}
                        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                                Moje mandaty
                            </h2>
                            {loading ? (
                                <p>Ładowanie...</p>
                            ) : mandates.length === 0 ? (
                                <p className="text-gray-500">Brak aktywnych mandatów.</p>
                            ) : (
                                <div className="flow-root">
                                    <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                                        {mandates.map((mandate) => (
                                            <li key={mandate.id} className="py-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                                            {mandate.product} - {mandate.duration}
                                                        </p>
                                                        <p className="truncate text-sm text-gray-500">
                                                            {mandate.volume} {mandate.volumeUnit} @ {mandate.price} PLN
                                                        </p>
                                                    </div>
                                                    <div>
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
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}

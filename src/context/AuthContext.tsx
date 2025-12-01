"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

type UserRole = "client" | "trading" | null;

interface AuthContextType {
    user: User | null;
    role: UserRole;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    setUser(firebaseUser);
                    // Fetch user role from Firestore
                    const userDocRef = doc(db, "users", firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        setRole(userDoc.data().role as UserRole);
                    } else {
                        // Create new user document with default role 'client'
                        const defaultRole: UserRole = "client";
                        await setDoc(userDocRef, {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            role: defaultRole,
                            createdAt: new Date(),
                        });
                        setRole(defaultRole);
                    }
                } else {
                    setUser(null);
                    setRole(null);
                }
            } catch (error) {
                console.error("Error in AuthContext:", error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await firebaseSignOut(auth);
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

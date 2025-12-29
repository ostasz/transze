import "server-only";
import { getApps, initializeApp, getApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

export function getAdminApp() {
    if (getApps().length === 0) {
        console.log("[FirebaseAdmin] Initializing with Project ID:", serviceAccount.projectId);
        console.log("[FirebaseAdmin] Client Email present:", !!serviceAccount.clientEmail);
        console.log("[FirebaseAdmin] Private Key present:", !!serviceAccount.privateKey);

        return initializeApp({
            credential: cert(serviceAccount),
        });
    }
    return getApp();
}

export const adminAuth = getAuth(getAdminApp());
export const adminDb = getFirestore(getAdminApp());

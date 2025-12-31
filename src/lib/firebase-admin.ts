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
        // console.log("[FirebaseAdmin] Initializing..."); // Quiet logs for build
        return initializeApp({
            credential: cert(serviceAccount),
        });
    }
    return getApp();
}

// Lazy load instances to prevent build-time initialization errors
let _adminAuth: ReturnType<typeof getAuth> | null = null;
let _adminDb: ReturnType<typeof getFirestore> | null = null;

export function getAdminAuth() {
    if (!_adminAuth) {
        _adminAuth = getAuth(getAdminApp());
    }
    return _adminAuth;
}

export function getAdminDb() {
    if (!_adminDb) {
        _adminDb = getFirestore(getAdminApp());
    }
    return _adminDb;
}

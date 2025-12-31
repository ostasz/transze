import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { uid, email, name, clientConfig, companyDetails } = body;

        if (!uid) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Update user in Firebase Auth (if email or name changed)
        // Note: Changing email might require re-verification or handling secure rules. 
        // For now we allow it for admins/traders managing clients.
        const updateData: any = {};
        if (email) updateData.email = email;
        if (name) updateData.displayName = name;

        if (Object.keys(updateData).length > 0) {
            await getAdminAuth().updateUser(uid, updateData);
        }

        // Update user document in Firestore
        const firestoreUpdate: any = {};
        if (email) firestoreUpdate.email = email;
        if (name) firestoreUpdate.displayName = name;
        if (clientConfig) firestoreUpdate.clientConfig = clientConfig;
        if (companyDetails) firestoreUpdate.companyDetails = companyDetails;

        await getAdminDb().collection("users").doc(uid).update(firestoreUpdate);

        return NextResponse.json({
            success: true,
            message: "Dane klienta zostały zaktualizowane.",
        });

    } catch (error: any) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

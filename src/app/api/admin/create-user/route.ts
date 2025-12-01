import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
    try {
        // TODO: Verify ID token to ensure caller is admin/supervisor
        // For now, we trust the frontend protection + backend role check if we passed the token

        const body = await request.json();
        const { email, role, name } = body;

        if (!email || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Domain validation for Traders
        if (role === "trader") {
            if (!email.endsWith("@ekovoltis.pl")) {
                return NextResponse.json(
                    { error: "Traderzy muszą posiadać adres email w domenie @ekovoltis.pl" },
                    { status: 400 }
                );
            }
        }

        // Create user in Firebase Auth
        const userRecord = await adminAuth.createUser({
            email,
            emailVerified: false,
            displayName: name,
            disabled: false,
        });

        // Set custom claims (optional, but good for security rules)
        await adminAuth.setCustomUserClaims(userRecord.uid, { role });

        // Create user document in Firestore
        await adminDb.collection("users").doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            role,
            displayName: name,
            createdAt: new Date(),
        });

        // Generate password reset link (Activation link)
        const link = await adminAuth.generatePasswordResetLink(email);

        return NextResponse.json({
            success: true,
            message: "Użytkownik utworzony pomyślnie.",
            activationLink: link // In production, you would email this. For now, we return it to display.
        });

    } catch (error: any) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    try {
        const link = await adminAuth.generatePasswordResetLink(email);
        return NextResponse.json({ link });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

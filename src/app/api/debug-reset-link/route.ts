import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    return NextResponse.json({ error: "Password reset is not yet implemented for Postgres." }, { status: 501 });
}

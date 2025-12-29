import { NextResponse } from "next/server";
import { searchLatestRemoteMail, getMessageDetails, getMessageAttachment, markAsRead, getGmailClient } from "@/lib/gmail";
import { processEnergyPriceData, processFuturesData } from "@/lib/energy-prices";

export const dynamic = 'force-dynamic'; // Ensure not cached

export async function GET() {
    try {
        console.log("[Cron] Starting Automated Email Import...");

        // Debug: Check who we are logged in as
        const gmail = getGmailClient();
        const profile = await gmail.users.getProfile({ userId: 'me' });
        console.log(`[Cron] Authenticated as: ${profile.data.emailAddress}`);

        const results = [];

        // --- TASK 1: RDN (tge_p) ---
        console.log("[Cron] Checking for RDN data (tge_p)...");
        const messagesP = await searchLatestRemoteMail('filename:tge_p');
        if (messagesP.length > 0) {
            const msg = messagesP[0];
            const details = await getMessageDetails(msg.id!);

            // Robust attachment finding
            let attachmentId = details.payload?.body?.attachmentId;
            let filename = "tge_p.csv";

            if (!attachmentId && details.payload?.parts) {
                const part = details.payload.parts.find(p => p.filename && p.filename.includes('tge_p'));
                if (part) {
                    attachmentId = part.body?.attachmentId;
                    filename = part.filename || filename;
                }
            }

            if (attachmentId) {
                console.log(`[Cron] Processing RDN attachment: ${filename} from message ${msg.id}`);
                const csvData = await getMessageAttachment(msg.id!, attachmentId);
                // Process
                const result = await processEnergyPriceData(csvData);
                results.push(`RDN: ${result.processed} records`);
            }
        } else {
            console.log("[Cron] No RDN email found.");
        }

        // --- TASK 2: FUTURES (tge_f) ---
        console.log("[Cron] Checking for Futures data (tge_f)...");
        const messagesF = await searchLatestRemoteMail('filename:tge_f');
        if (messagesF.length > 0) {
            const msg = messagesF[0];
            const details = await getMessageDetails(msg.id!);

            let attachmentId = details.payload?.body?.attachmentId;
            let filename = "tge_f.csv";

            if (!attachmentId && details.payload?.parts) {
                const part = details.payload.parts.find(p => p.filename && p.filename.includes('tge_f'));
                if (part) {
                    attachmentId = part.body?.attachmentId;
                    filename = part.filename || filename;
                }
            }

            if (attachmentId) {
                console.log(`[Cron] Processing Futures attachment: ${filename} from message ${msg.id}`);
                const csvData = await getMessageAttachment(msg.id!, attachmentId);
                // Process
                const result = await processFuturesData(csvData);
                results.push(`Futures: ${result.processed} records`);
            }
        } else {
            console.log("[Cron] No Futures email found.");
        }

        return NextResponse.json({
            success: true,
            message: "Import cycle completed",
            details: results.join(", ")
        });

    } catch (error: any) {
        console.error("[Cron] Import failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

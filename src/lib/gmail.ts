import { google } from "googleapis";

// Credentials provided by user
const CLIENT_ID = process.env.GMAIL_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || "";
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN || "";

export function getGmailClient() {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
        throw new Error("Missing Gmail OAuth credentials. Please check GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN in your .env file.");
    }

    const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        "https://developers.google.com/oauthplayground" // Common redirect URI for manual tokens
    );

    oauth2Client.setCredentials({
        refresh_token: REFRESH_TOKEN,
    });

    return google.gmail({ version: "v1", auth: oauth2Client });
}

// Search for the LATEST email with specific criteria (read or unread)
export async function searchLatestRemoteMail(query: string = 'filename:tge_p') {
    const gmail = getGmailClient();
    const res = await gmail.users.messages.list({
        userId: "me",
        q: `has:attachment ${query}`, // Removed is:unread, added broad attachment search
        maxResults: 1, // Get only the latest one
    });

    return res.data.messages || [];
}

export async function getMessageAttachment(messageId: string, attachmentId: string) {
    const gmail = getGmailClient();
    const res = await gmail.users.messages.attachments.get({
        userId: "me",
        messageId,
        id: attachmentId,
    });

    if (!res.data.data) return null;
    return Buffer.from(res.data.data, "base64").toString("utf-8");
}

export async function markAsRead(messageId: string) {
    const gmail = getGmailClient();
    await gmail.users.messages.modify({
        userId: "me",
        id: messageId,
        requestBody: {
            removeLabelIds: ["UNREAD"],
        },
    });
}

export async function getMessageDetails(messageId: string) {
    const gmail = getGmailClient();
    const res = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
    });
    return res.data;
}

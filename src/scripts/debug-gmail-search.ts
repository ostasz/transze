
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

// Manually load env for standalone script
const loadEnv = () => {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            envConfig.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    process.env[key.trim()] = value.trim();
                }
            });
        }
    } catch (e) {
        console.error("Error loading .env.local", e);
    }
};

loadEnv();

async function main() {
    // Dynamic import to ensure env is loaded first
    const { getGmailClient } = await import('../lib/gmail');

    // getGmailClient returns the google.gmail service instance directly
    const gmail = await getGmailClient();
    // const auth = await getGmailClient(); // Incorrect, it returns service not auth
    // const gmail = google.gmail({ version: 'v1', auth });

    const query = 'filename:tge_f';
    console.log(`Searching for: "${query}"`);

    const res = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 5
    });

    const messages = res.data.messages;
    if (!messages || messages.length === 0) {
        console.log("No messages found.");
        return;
    }

    console.log(`Found ${messages.length} messages. Fetching details...`);

    for (const msg of messages) {
        const details = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id!,
            format: 'metadata'
        });

        const headers = details.data.payload?.headers;
        const subject = headers?.find(h => h.name === 'Subject')?.value;
        const date = headers?.find(h => h.name === 'Date')?.value;
        const internalDate = details.data.internalDate;

        const validAttachments = details.data.payload?.parts?.filter(p => p.filename && p.filename.length > 0) || [];
        const attachmentNames = validAttachments.map(p => p.filename).join(', ');

        console.log(`\nID: ${msg.id}`);
        console.log(`Subject: ${subject}`);
        console.log(`Date Header: ${date}`);
        console.log(`Internal Date (Timestamp): ${internalDate}`);
        console.log(`Attachments: ${attachmentNames}`);
        console.log(`Snippet: ${details.data.snippet}`);
    }
}

main().catch(console.error);

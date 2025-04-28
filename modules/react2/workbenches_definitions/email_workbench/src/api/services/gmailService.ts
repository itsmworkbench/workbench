import { gapi } from "gapi-script";

export const CLIENT_ID = "522748034581-k40pgt86pok3ktvnbfepoernm641ksh6.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/gmail.readonly";

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let accessToken: string | null = null;

export const initGoogleClient = () =>
    new Promise<void>((resolve, reject) => {
        gapi.load("client", async () => {
            try {
                await gapi.client.init({
                    apiKey: "", // not necessary if we use OAuth2
                    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],
                });
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    });

export async function signInWithGmail(): Promise<void> {
    return new Promise((resolve, reject) => {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (resp: any) => {
                if (resp.error) return reject(resp);
                accessToken = resp.access_token;
                resolve();
            },
        });
        tokenClient.requestAccessToken();
    });
}

export async function fetchLatestEmails(limit = 2): Promise<
    { from: string; subject: string; date: string; snippet: string }[]
> {
    if (!gapi.client.gmail) throw new Error("Gmail API not loaded");

    const res = await gapi.client.gmail.users.messages.list({
        userId: "me",
        maxResults: limit,
    });

    const emails = await Promise.all(
        (res.result.messages || []).map(async (msg: any) => {
            const msgRes = await gapi.client.gmail.users.messages.get({
                userId: "me",
                id: msg.id,
            });

            const headers = msgRes.result.payload?.headers || [];
            const get = (name: string) => headers.find((h: any) => h.name === name)?.value || "";

            return {
                from: get("From"),
                subject: get("Subject"),
                date: get("Date"),
                snippet: msgRes.result.snippet || "",
            };
        })
    );

    return emails;
}

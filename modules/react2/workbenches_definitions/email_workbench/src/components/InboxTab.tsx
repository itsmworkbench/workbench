import React, { useState } from "react";
import { callPrompt, callResource, callTool } from "../client-server/mcpClient";
import { initGoogleClient, signInWithGmail } from "../api/services/gmailService";
import '../styles/MissingDataEmail.css'

type EmailPreview = {
    from: string;
    subject: string;
    date: string;
    snippet: string;
};

const InboxTab: React.FC = () => {
    const [inbox, setInbox] = useState<EmailPreview[]>([]);
    const [summary, setSummary] = useState<string | null>(null);

    const fetchInbox = async () => {
        try {
            const resource = await callResource("gmail://inbox");
            const previews = resource.contents.map((c: any) => {
                const data = JSON.parse(c.text);
                return {
                    from: data.from,
                    subject: data.subject,
                    date: data.date,
                    snippet: data.snippet
                };
            });
            setInbox(previews);
        } catch (err) {
            console.error("Error fetching inbox:", err);
        }
    };

    const handleSignInAndFetch = async () => {
        try {
            await initGoogleClient();
            await signInWithGmail();
            await fetchInbox();
        } catch (err) {
            console.error("Authentication failed", err);
        }
    };

    const handleSummarize = async () => {
        try {
            const emails = inbox.map((email) => `${email.subject}: ${email.snippet}`).join("\n");

            const promptRes = await callPrompt("summarize-inbox-prompt", { emails });

            const messages = promptRes.messages.map((m: any) => ({
                role: m.role,
                content: m.content.text
            }));

            const result = await callTool("call-openai", { messages });
            const text = (result.content as any).find((c: any) => c.type === "text")?.text;
            setSummary(text || null);
        } catch (err) {
            console.error("Error summarizing:", err);
        }
    };

    return (
        <div className="section">
            <button className="button" onClick={handleSignInAndFetch}>
                Sign in and Fetch Inbox
            </button>

            {inbox.length > 0 && (
                <>
                    <ul>
                        {inbox.map((email, i) => (
                            <li key={i}>
                                <strong>From:</strong> {email.from}<br />
                                <strong>Subject:</strong> {email.subject}<br />
                                <strong>Date:</strong> {new Date(email.date).toLocaleString()}<br />
                                <strong>Snippet:</strong> {email.snippet}
                            </li>
                        ))}
                    </ul>

                    <button className="button" onClick={handleSummarize}>Summarize Inbox</button>
                    {summary && <pre className="summary-box">{summary}</pre>}
                </>
            )}
        </div>
    );
};

export default InboxTab;

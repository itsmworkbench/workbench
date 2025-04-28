import React, { useState } from "react";
import { extractedVariables, ticket } from "../utils/ticket";
import { callPrompt, callTool } from "../client-server/mcpClient";
import '../styles/MissingDataEmail.css'

const GenerateEmailTab: React.FC = () => {
    const [missingVariables, setMissingVariables] = useState<string[]>([]);
    const [generatedEmail, setGeneratedEmail] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditable, setIsEditable] = useState(false);
    const [emailSent, setEmailSent] = useState<boolean>(false);

    const detectMissingVariables = (vars: Record<string, any>): string[] =>
        Object.keys(vars).filter((key) => vars[key] === undefined);

    const handleGenerateEmail = async () => {
        setGeneratedEmail("");
        setError(null);
        setLoading(true);

        const missing = detectMissingVariables(extractedVariables);
        setMissingVariables(missing);

        if (missing.length === 0) {
            setLoading(false);
            return;
        }

        try {
            const promptResponse = await callPrompt("email-generator-prompt", {
                recipient: ticket.issuer,
                topic: "Missing variables: " + missing.join(", ")
            });

            const messages = promptResponse.messages.map((m: any) => ({
                role: m.role,
                content: m.content.text
            }));

            const result = await callTool("call-openai", { messages });
            const emailText = (result.content as any).find((c: any) => c.type === "text")?.text;
            setGeneratedEmail(emailText || "");
        } catch (err) {
            console.error("Error generating email:", err);
            setError("Failed to generate email.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async () => {
        if (!generatedEmail) return;

        try {
            await callTool("send-email", {
                to: ticket.issuer,
                subject: `Missing Information for Ticket: ${ticket.ticketName}`,
                body: generatedEmail
            });

            setEmailSent(true);
            alert("Email sent successfully!");
        } catch (err) {
            console.error("Error sending email:", err);
            setError("Failed to send email.");
        }
    };

    return (
        <div>
            <h3>Ticket Details</h3>
            <pre>{JSON.stringify(ticket, null, 2)}</pre>

            <h3>Extracted Variables</h3>
            <ul>
                {Object.entries(extractedVariables).map(([key, value]) => (
                    <li key={key}>
                        <strong>{key}:</strong>{" "}
                        {value !== undefined ? value.toString() : <span className="missing">Missing</span>}
                    </li>
                ))}
            </ul>

            <button className="button" onClick={handleGenerateEmail} disabled={loading}>
                {loading ? "Generating..." : "Generate Email"}
            </button>

            {missingVariables.length > 0 && (
                <>
                    <h3 className="missing">Missing Variables:</h3>
                    <ul>{missingVariables.map((v) => <li key={v}>{v}</li>)}</ul>
                </>
            )}

            {generatedEmail && (
                <div>
                    <h3>Generated Email:</h3>
                    <textarea
                        className="email-textbox"
                        value={generatedEmail}
                        onChange={(e) => setGeneratedEmail(e.target.value)}
                        readOnly={!isEditable}
                    />
                    <div className="button-group">
                        <button className="button" onClick={() => setIsEditable(!isEditable)}>
                            {isEditable ? "Done Editing" : "Edit Email"}
                        </button>
                        <button
                            className="button send-button"
                            onClick={handleSendEmail}
                            disabled={emailSent}
                        >
                            {emailSent ? "Email Sent" : "Send Email"}
                        </button>
                    </div>
                </div>
            )}

            {error && <div className="error">{error}</div>}
        </div>
    );
};

export default GenerateEmailTab;

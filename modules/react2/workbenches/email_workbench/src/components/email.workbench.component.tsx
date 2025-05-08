import React, { useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    TextField,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent
} from "@mui/material";
import { useMcpClient } from "@itsmworkbench/mcp";
import {useItsmStateTicket, useItsmTicketState} from "@itsmworkbench/itsm_state";

const PURPOSE_OPTIONS = [
    "Request More Data",
    "Request Approval",
    "Request Closure"
];

export const EmailWorkbench: React.FC = () => {
    const { emailClient, connected } = useMcpClient();
    const [purpose, setPurpose] = useState(PURPOSE_OPTIONS[0]);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const itsmTicket = useItsmStateTicket();
    const itsmTicketState = useItsmTicketState();

    console.log(itsmTicket);
    console.log(itsmTicketState);

    const handlePurposeChange = (event: SelectChangeEvent) => {
        setPurpose(event.target.value);
    };

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const promptResponse = await emailClient.callPrompt("email-generator-prompt", {
                recipient: "user@example.com",
                topic: purpose
            });

            const messages = promptResponse.messages.map((m: any) => ({
                role: m.role,
                content: m.content.text
            }));

            const result = await emailClient.callTool("call-openai", { messages });
            const generated = result.content.find((c: any) => c.type === "text")?.text;

            setBody(generated || "");
        } catch (err) {
            setError("Failed to generate email");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        try {
            await emailClient.callTool("send-email", {
                to: "user@example.com",
                subject,
                body
            });
            setEmailSent(true);
            alert("Email sent!");
        } catch (err) {
            setError("Failed to send email");
            console.error(err);
        }
    };

    return (
        <Paper elevation={3} sx={{ padding: 4, maxWidth: 800, margin: "2rem auto" }}>
            <Typography variant="h5" gutterBottom>
                Email Workbench (MCP Connected: {connected ? "YES" : "NO"})
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
                <FormControl fullWidth>
                    <InputLabel id="purpose-label">Purpose</InputLabel>
                    <Select
                        labelId="purpose-label"
                        value={purpose}
                        onChange={handlePurposeChange}
                        label="Purpose"
                    >
                        {PURPOSE_OPTIONS.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    label="Subject"
                    variant="outlined"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    fullWidth
                />

                <TextField
                    label="Body"
                    variant="outlined"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    multiline
                    rows={10}
                    fullWidth
                />

                <Box display="flex" gap={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleGenerate}
                        disabled={loading || !connected}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Generate Email"}
                    </Button>

                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSend}
                        disabled={emailSent || !connected}
                    >
                        {emailSent ? "Email Sent" : "Send Email"}
                    </Button>
                </Box>

                {error && (
                    <Typography color="error" mt={2}>
                        {error}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PromptCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { openaiCompletion } from "../api/services/openaiService";
import { sendEmailClient } from "../utils/sendEmail";
import { fetchLatestEmails } from "../api/services/gmailService";

export const server = new McpServer({
    name: "Email MCP Server",
    version: "1.0.0"
});

// ---------------- PROMPT: Generate Email ----------------

type PromptArgsRawShape = any
const emailPromptArgs: PromptArgsRawShape = {
    recipient: z.string(),
    topic: z.string()
};

server.prompt(
    "email-generator-prompt",
    "Prompt to generate a polite email.",
    emailPromptArgs,
    (({recipient, topic}: any) => ({
        messages: [
            {
                role: "assistant",
                content: {
                    type: "text",
                    text: "You are an AI assistant that writes professional emails. No need to add the subject, just keep it simple."
                }
            },
            {
                role: "user",
                content: {
                    type: "text",
                    text: `Please write an email to ${recipient} about the topic: "${topic}".`
                }
            }
        ]
    })) as any
);

// ---------------- PROMPT: Summarize Inbox ----------------

const summarizePromptArgs: PromptArgsRawShape = {
    emails: z.string()
};

server.prompt(
    "summarize-inbox-prompt",
    "Prompt to summarize multiple email snippets.",
    summarizePromptArgs,
    (({emails}: any) => ({
        messages: [
            {
                role: "assistant",
                content: {
                    type: "text",
                    text: "You are an assistant that summarizes multiple emails into a concise overview."
                }
            },
            {
                role: "user",
                content: {
                    type: "text",
                    text: `Summarize the following emails:\n\n${emails}`
                }
            }
        ]
    })) as PromptCallback<typeof summarizePromptArgs>
);

// ---------------- TOOL: Send Email with EmailJS ----------------

server.tool(
    "send-email",
    {
        to: z.string().email(),
        subject: z.string(),
        body: z.string()
    },
    async ({ to, subject, body }) => {
        await sendEmailClient({ to, subject, body });

        return {
            content: [
                {
                    type: "text",
                    text: `Email sent to ${to} via EmailJS.`
                }
            ]
        };
    }
);


// ---------------- TOOL: Call OpenAI ----------------

const messageSchema = z.object({
    role: z.enum(["system", "user", "assistant"]),
    content: z.string()
});

server.tool(
    "call-openai",
    {
        messages: z.array(messageSchema)
    },
    async ({messages}) => {
        const result = await openaiCompletion(messages);

        return {
            content: [
                {
                    type: "text",
                    text: result.text
                }
            ]
        };
    }
);

// ---------------- RESOURCE: Inbox ----------------

server.resource(
    "inbox",
    "gmail://inbox",
    async () => {
        const emails = await fetchLatestEmails(2);
        return {
            contents: emails.map((email, index) => ({
                uri: `custom://inbox/${index}`,
                text: JSON.stringify(email),
                mimeType: "text/plain"
            }))
        };
    }
);
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchLatestEmails } from "@itsmworkbench/gmail_service";
import { z } from "zod";
import {openaiCompletion} from "@itsmworkbench/openai_service";

export const mcpEmailServer = new McpServer(
    { name: "itsm-workbench-email-server", version: "1.0.0" },
    { capabilities: { prompts: {}, tools: { sendEmail: {} }, resources: {} } }
);

// ---------------- PROMPT: Generate Email ----------------

type PromptArgsRawShape = any
const emailPromptArgs: PromptArgsRawShape = {
    recipient: z.string(),
    topic: z.string()
};

mcpEmailServer.prompt(
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

// ---------------- TOOL: Send Email with EmailJS ----------------

mcpEmailServer.tool(
    "send-email",
    {
        to: z.string().email(),
        subject: z.string(),
        body: z.string()
    },
    async ({ to, subject, body }) => {
        await sendEmailClient({ to, subject, body }); // TODO: use gapi instead of emailjs

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

mcpEmailServer.tool(
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

mcpEmailServer.resource(
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


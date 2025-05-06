import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchLatestEmails } from "@itsmworkbench/gmail_service";

export const mcpEmailServer = new McpServer(
    { name: "itsm-workbench-email-server", version: "1.0.0" },
    { capabilities: { prompts: {}, tools: { sendEmail: {} }, resources: {} } }
);

//register tools, resources and prompts

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


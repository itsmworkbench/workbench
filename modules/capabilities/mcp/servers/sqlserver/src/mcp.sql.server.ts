import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const mcpSqlServer = new McpServer(
    { name: "itsm-workbench-sql-server", version: "1.0.0" },
    { capabilities: { prompts: {}, tools: { sendEmail: {} }, resources: {} } }
);

//register tools, resources and prompts

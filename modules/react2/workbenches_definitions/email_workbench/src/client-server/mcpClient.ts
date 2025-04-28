import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {clientTransport} from "./loopback/loopbackConnection";

export const client = new Client(
    {
        name: "missing-email-ui",
        version: "1.0.0"
    },
    {
        capabilities: {
            prompts: {},
            tools: {},
            resources: {}
        }
    }
);

let isConnected = false;

export const connectClient = async () => {
    if (isConnected) return;

    let retry = 0;
    while (retry < 10) {
        try {
            await client.connect(clientTransport);
            isConnected = true;
            console.log("Client connected to loopback transport");
            return;
        } catch (err) {
            console.warn("Waiting for server to connect...", err);
            retry++;
            await new Promise((res) => setTimeout(res, 200)); // wait 200ms
        }
    }

    throw new Error("Failed to connect to loopback transport: server not ready");
};

export const callPrompt = async (name: string, args: any) => {
    await connectClient();
    return await client.getPrompt({ name, arguments: args });
};

export const callTool = async (name: string, args: any) => {
    await connectClient();
    return await client.callTool({ name, arguments: args });
};

export const callResource = async (uri: string) => {
    await connectClient();
    return await client.readResource({
        uri: uri
    });
};

export const listTools = async () => {
    await connectClient();
    return client.listTools();
};

export const listPrompts = async () => {
    await connectClient();
    return client.listPrompts();
};

export const listResources = async () => {
    await connectClient();
    return client.listResources();
};


export const getToolDefinition = async (name: string) => {
    await connectClient();
    const res = await client.listTools();
    return res.tools.find((t: any) => t.name === name);
};

export const getPromptDefinition = async (name: string) => {
    await connectClient();
    const res = await client.listPrompts();
    return res.prompts.find((p: any) => p.name === name);
};

export const getResourceDefinition = async (uriOrTemplate: string) => {
    await connectClient();
    const res = await client.listResources();

    return res.resources.find(
        (r: any) => r.uri === uriOrTemplate || r.uriTemplate === uriOrTemplate
    );
};

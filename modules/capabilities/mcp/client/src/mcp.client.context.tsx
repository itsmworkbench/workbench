import * as React from "react";
import { createContext, useContext, useMemo, useEffect, ReactNode } from "react";
import { Client } from "@modelcontextprotocol/sdk/dist/esm/client/index";
import {emailClientTransport, sqlClientTransport} from "./connection/loopbackConnection";

type McpClientContextType = {
    emailClient: Client;
    sqlClient: Client;
    connected: boolean;
};

const McpClientContext = createContext<McpClientContextType | null>(null);

export const McpClientProvider: React.FC<{ children: ReactNode }> = ({
                                                                         children
                                                                     }) => {
    const emailClient = useMemo(() =>
            new Client(
                { name: "itsm-workbench-email-client", version: "1.0.0" },
                { capabilities: { prompts: {}, tools: { sendEmail: {} }, resources: {} } }
            ),
        []);

    const sqlClient = useMemo(() =>
            new Client(
                { name: "itsm-workbench-sql-client", version: "1.0.0" },
                { capabilities: { prompts: {}, tools: { executeSqlQuery: {} }, resources: {} } }
            ),
        []);

    const [connected, setConnected] = React.useState(false);

    useEffect(() => {
        let cancelled = false;

        // Se conectează la ambele servere
        Promise.all([
            emailClient.connect(emailClientTransport),
            sqlClient.connect(sqlClientTransport),
        ]).then(() => {
            if (!cancelled) setConnected(true);
        }).catch((err: any) => {
            console.error("MCP client failed to connect:", err);
        });

        return () => {
            cancelled = true;
        };
    }, [emailClient, sqlClient]);

    return (
        <McpClientContext.Provider value={{ emailClient, sqlClient, connected }}>
            {children}
        </McpClientContext.Provider>
    );
};

export function useMcpClient(): McpClientContextType {
    const ctx = useContext(McpClientContext);
    if (!ctx) {
        throw new Error("useMcpClient must be used within McpClientProvider");
    }
    return ctx;
}

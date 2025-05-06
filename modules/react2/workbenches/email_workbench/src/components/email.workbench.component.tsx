import React, {useEffect, useState} from "react";
import { useMcpClient } from "@itsmworkbench/mcp";

export const EmailWorkbench: React.FC = () => {
    const { emailClient, connected } = useMcpClient();

    return (
        <div>
            <h2>Email Workbench (MCP Connected: {connected?"YES":"NO"})</h2>
        </div>
    );
};

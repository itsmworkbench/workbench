import React, { useState } from "react";
import { listPrompts, listResources, listTools, getToolDefinition, getPromptDefinition, getResourceDefinition } from "../client-server/mcpClient";
import '../styles/MissingDataEmail.css'

type TabType = "tools" | "prompts" | "resources";

const ExploreMcpTab: React.FC = () => {
    const [type, setType] = useState<TabType | null>(null);
    const [items, setItems] = useState<any[]>([]);
    const [details, setDetails] = useState<string | null>(null);

    const handleList = async (t: TabType) => {
        setType(t);
        setDetails(null);
        try {
            if (t === "tools") {
                const res = await listTools();
                setItems(res.tools || []);
            } else if (t === "prompts") {
                const res = await listPrompts();
                setItems(res.prompts || []);
            } else {
                const res = await listResources();
                setItems(res.resources || []);
            }
        } catch (err) {
            console.error(`Error listing ${t}`, err);
        }
    };

    const handleShowDetails = async (item: any) => {
        try {
            if (type === "prompts") {
                const def = await getPromptDefinition(item.name);
                setDetails(JSON.stringify(def, null, 2));
            } else if (type === "tools") {
                const def = await getToolDefinition(item.name);
                setDetails(JSON.stringify(def, null, 2));
            } else if (type === "resources") {
                const def = await getResourceDefinition(item.uri || item.uriTemplate);
                setDetails(JSON.stringify(def, null, 2));
            }
        } catch (err) {
            console.error("Error fetching details:", err);
        }
    };

    return (
        <div className="section">
            <h3>Explore MCP</h3>
            <div className="button-group">
                <button className="button" onClick={() => handleList("tools")}>List Tools</button>
                <button className="button" onClick={() => handleList("prompts")}>List Prompts</button>
                <button className="button" onClick={() => handleList("resources")}>List Resources</button>
            </div>

            {type && (
                <div className="mcp-listing">
                    <h4>Available {type}</h4>
                    <ul>
                        {items.map((item, i) => (
                            <li key={i}>
                                <code onClick={() => handleShowDetails(item)} style={{ cursor: "pointer" }}>
                                    {item.name || item.uri || item.uriTemplate}
                                </code>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {details && (
                <div className="section">
                    <h4>Details</h4>
                    <pre className="summary-box">{details}</pre>
                </div>
            )}
        </div>
    );
};

export default ExploreMcpTab;

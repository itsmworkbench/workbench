import React, { useState } from "react";
import GenerateEmailTab from "./GenerateEmailTab";
import InboxTab from "./InboxTab";
import ExploreMcpTab from "./ExploreMcpTab";
import "../styles/TabsLayout.css";

export const TabsLayout: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<"generate" | "inbox" | "explore">("generate");

    return (
        <div className="container">
            <header className="tab-header">
                <button className="button" onClick={() => setSelectedTab("generate")}>Generate Email</button>
                <button className="button" onClick={() => setSelectedTab("inbox")}>See Inbox</button>
                <button className="button" onClick={() => setSelectedTab("explore")}>Explore MCP</button>
            </header>

            <main className="tab-content">
                {selectedTab === "generate" && <GenerateEmailTab />}
                {selectedTab === "inbox" && <InboxTab />}
                {selectedTab === "explore" && <ExploreMcpTab />}
            </main>
        </div>
    );
};

export default TabsLayout;

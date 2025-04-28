import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { server } from "./mcpServer";
import {serverTransport} from "./loopback/loopbackConnection";

dotenv.config();

const app = express();
app.use(cors());

// let transport: SSEServerTransport | null = null;
//
// app.get("/sse", (req, res) => {
//     transport = new SSEServerTransport("/messages", res);
//     server.connect(transport);
// });
//
// app.post("/messages", (req, res) => {
//     if (transport) {
//         transport.handlePostMessage(req, res);
//     } else {
//         res.status(500).send("Transport not initialized.");
//     }
// });

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`MCP Server running at http://localhost:${port}`);
});

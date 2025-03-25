import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as https from "https";
import * as fs from "fs";
import databaseRoutes from "./routes/databaseRoutes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", databaseRoutes);

const PORT = process.env.PORT || 5000;

const options = {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
};

https.createServer(options, app).listen(PORT, () => {
    console.log(`HTTPS server running on https://localhost:${PORT}`);
});

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import databaseRoutes from "./routes/databaseRoutes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", databaseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

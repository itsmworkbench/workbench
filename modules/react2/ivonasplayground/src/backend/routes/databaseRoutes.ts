import * as express from "express";
import {createDb} from "../db/DbFactoy";

const router = express.Router();

router.post("/select", async (req, res) => {
    const { query, dbType } = req.body;

    try {
        const db = createDb(dbType);
        const result = await db.select(query);
        res.json(result);
    } catch (error) {
        let errorMessage = "An unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(500).json({ error: errorMessage });
    }
});

router.post("/update", async (req, res) => {
    const { query, dbType } = req.body;

    try {
        const db = createDb(dbType);
        const result = await db.update(query);
        res.json(result);
    } catch (error) {
        let errorMessage = "An unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(500).json({ error: errorMessage });
    }
});

router.get("/test", async (req, res) => {
    try {
        const dbType = req.query.dbType as string;
        const db = createDb(dbType);

        const message = await db.testConnection();
        res.json({ message });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});


export default router;

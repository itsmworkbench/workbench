import { Pool } from "pg";
import * as dotenv from "dotenv";
import {IDataAccess, SqlResult, SqlSelect, SqlUpdate, SqlUpdateResult} from "@itsmworkbench/shared/IDataAccess";

dotenv.config();

export function postgresAdapter(password: string): IDataAccess {
    const pool = new Pool({
        user: process.env.DB_POSTGRES_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: password,
        port: Number(process.env.DB_POSTGRES_PORT),
    });

    return {
        async select(query: SqlSelect): Promise<SqlResult> {
            const result = await pool.query(query.query);
            return { type: "select", rows: result.rows };
        },
        async update(query: SqlUpdate): Promise<SqlUpdateResult> {
            const result = await pool.query(query.query);
            return { type: "update", affectedRows: result.rowCount ?? 0 };
        },
        async testConnection() {
            await pool.query("SELECT 1");
            return "Postgres connected!";
        }
    };
}

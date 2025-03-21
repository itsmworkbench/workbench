import * as mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import {IDataAccess, SqlResult, SqlSelect, SqlUpdate, SqlUpdateResult} from "@itsmworkbench/shared/IDataAccess";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_MARIADB_USER,
    password: process.env.DB_MARIADB_PASS,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_MARIADB_PORT),
});

export const mariadbAdapter: IDataAccess = {
    async select(query: SqlSelect): Promise<SqlResult> {
        const [rows] = await pool.query(query.query);
        return { type: "select", rows: rows as any[] };
    },
    async update(query: SqlUpdate): Promise<SqlUpdateResult> {
        const [result] = await pool.query(query.query);
        return { type: "update", affectedRows: (result as any).affectedRows };
    },
    async testConnection() {
        await pool.query("SELECT 1");
        return "Maria DB connected!";
    }
};

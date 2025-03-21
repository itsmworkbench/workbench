import {IDataAccess} from "@itsmworkbench/shared/IDataAccess";

const API_URL = "http://localhost:5000/api";

export const FetchHttpClient: IDataAccess = {
    async select(query, dbType) {
        const res = await fetch(`${API_URL}/select`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, dbType }),
        });
        return res.json();
    },

    async update(query, dbType) {
        const res = await fetch(`${API_URL}/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, dbType }),
        });
        return res.json();
    },

    async testConnection(dbType: string) {
        const res = await fetch(`${API_URL}/test?dbType=${dbType}`);
        const json = await res.json();
        return json.message;
    }
};

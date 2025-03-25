import {IDataAccess} from "@itsmworkbench/shared/IDataAccess";

const API_URL = "https://localhost:5000/api";

export const FetchHttpClient: IDataAccess = {
    async select(query, dbType, dbPassword) {
        const res = await fetch(`${API_URL}/select`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, dbType, dbPassword }),
        });
        return res.json();
    },

    async update(query, dbType, dbPassword) {
        const res = await fetch(`${API_URL}/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, dbType, dbPassword }),
        });
        return res.json();
    },

    async testConnection(dbType: string, dbPassword: string) {
        const res = await fetch(`${API_URL}/test?dbType=${dbType}&dbPassword=${dbPassword}`);
        const json = await res.json();
        return json.message;
    }
};

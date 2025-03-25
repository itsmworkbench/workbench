import axios from "axios";
import {IDataAccess} from "@itsmworkbench/shared/IDataAccess";

const API_URL = "https://localhost:5000/api";

export const AxiosHttpClient: IDataAccess = {
    async select(query, dbType, dbPassword) {
        const response = await axios.post(`${API_URL}/select`, { query, dbType, dbPassword });
        return response.data;
    },

    async update(query, dbType, dbPassword) {
        const response = await axios.post(`${API_URL}/update`, { query, dbType, dbPassword });
        return response.data;
    },

    async testConnection(dbType: string, dbPassword: string) {
        const response = await axios.get(`${API_URL}/test`, { params: { dbType, dbPassword } });
        return response.data.message;
    }
};

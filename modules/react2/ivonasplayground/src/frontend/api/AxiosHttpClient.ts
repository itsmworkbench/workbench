import axios from "axios";
import {IDataAccess} from "@itsmworkbench/shared/IDataAccess";

const API_URL = "http://localhost:5000/api";

export const AxiosHttpClient: IDataAccess = {
    async select(query, dbType) {
        const response = await axios.post(`${API_URL}/select`, { query, dbType });
        return response.data;
    },

    async update(query, dbType) {
        const response = await axios.post(`${API_URL}/update`, { query, dbType });
        return response.data;
    },

    async testConnection(dbType: string) {
        const response = await axios.get(`${API_URL}/test`, { params: { dbType } });
        return response.data.message;
    }

};

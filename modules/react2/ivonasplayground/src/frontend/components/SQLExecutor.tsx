import React, { useEffect, useState } from "react";
import { AxiosHttpClient } from "../api/AxiosHttpClient";
import { FetchHttpClient } from "../api/FetchHttpClient";
import { Button, TextField, MenuItem, Box, Typography } from "@mui/material";
import { PlayArrow, Refresh, Link } from "@mui/icons-material";
import { toast } from "react-toastify";
import { SecretDataProvider, SimplePassword, useSecretData } from "@itsmworkbench/secrets";
import { decryptString, defaultSecretData, hasEnteredPassword } from "@itsmworkbench/authentication";
import yaml from "js-yaml";
import encryptedConfig from '../config/encrypted-passwords.yaml';

const SQLExecutor: React.FC = () => {
    return (
        <SecretDataProvider secretData={defaultSecretData()}>
            <SimplePassword />
            <SQLExecutorInner />
        </SecretDataProvider>
    );
};

const SQLExecutorInner: React.FC = () => {
    const [sad] = useSecretData();
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [decryptedDbPassword, setDecryptedDbPassword] = useState<string | null>(null);

    const [httpClientType, setHttpClientType] = useState<"axios" | "fetch">("axios");
    const [sqlQuery, setSqlQuery] = useState("");
    const [dbType, setDbType] = useState("postgres");
    const [result, setResult] = useState<any>({});
    const [error, setError] = useState<string | null>(null);

    const clients = {
        axios: AxiosHttpClient,
        fetch: FetchHttpClient,
    } as const;

    const encryptedPasswords: Record<string, string> = {
        postgres: "Yephqygytl+J6XRO:EzNtP8pcQc7cSw0ZhVEdMv4U9tLX13e/",
        mariadb: "AwDYwBO7jL6DzIzy:26bIJP70iwnEVSWE5/Vsgyd7EjE=",
    };

    useEffect(() => {
        if (hasEnteredPassword(sad)) {
            const encrypted = encryptedPasswords[dbType];
            console.log(encrypted);
            decryptString(sad.cryptoKeyString)(encrypted)
                .then((decrypted) => {
                    setDecryptedDbPassword(decrypted);
                    console.log(decrypted);
                    setIsPasswordValid(true);
                })
                .catch(() => setIsPasswordValid(false));
        }
    }, [sad, dbType]);

    const handleExecute = async () => {
        if (!isPasswordValid || !decryptedDbPassword) {
            toast.error("Invalid password, cannot run query!");
            return;
        }
        try {
            setError(null);
            const httpClient = clients[httpClientType];
            let response;
            if (sqlQuery.trim().toLowerCase().startsWith("select")) {
                response = await httpClient.select({ query: sqlQuery }, dbType, decryptedDbPassword);
            } else {
                response = await httpClient.update({ query: sqlQuery }, dbType, decryptedDbPassword);
            }
            if (response.type === "select") {
                setResult(response.rows);
            } else if (response.type === "update") {
                setResult({ affectedRows: response.affectedRows });
            }
            toast.success("Query executed successfully!");
        } catch (err: any) {
            setError(err);
            toast.error(err);
        }
    };

    const handleTestConnection = async () => {
        if (!isPasswordValid || !decryptedDbPassword) {
            toast.error("Invalid password, cannot run query!");
            return;
        }
        try {
            const httpClient = clients[httpClientType];
            const message = await httpClient.testConnection(dbType, decryptedDbPassword);
            toast.success(message);
        } catch (error) {
            toast.error("Connection failed!");
        }
    };

    const handleReset = () => {
        setSqlQuery("");
        setResult({});
        setError(null);
    };

    return (
        <Box sx={{ maxWidth: 700, margin: "auto", textAlign: "center", p: 3 }}>
            <Typography variant="h4" gutterBottom>SQL</Typography>
            <TextField
                select
                label="Environment"
                value={dbType}
                onChange={(e) => setDbType(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
            >
                <MenuItem value="postgres">PostgreSQL</MenuItem>
                <MenuItem value="mariadb">MariaDB</MenuItem>
            </TextField>

            <TextField
                select
                label="HTTP Client"
                value={httpClientType}
                onChange={(e) => setHttpClientType(e.target.value as "axios" | "fetch")}
                fullWidth
                sx={{ mb: 2 }}
            >
                <MenuItem value="axios">Axios</MenuItem>
                <MenuItem value="fetch">Fetch API</MenuItem>
            </TextField>

            <TextField
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                placeholder="Enter your SQL query..."
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                sx={{ mb: 2 }}
            />

            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                <Button variant="contained" startIcon={<PlayArrow />} onClick={handleExecute}>
                    EXECUTE
                </Button>
                <Button variant="contained" startIcon={<Link />} onClick={handleTestConnection}>
                    TEST CONNECTION
                </Button>
                <Button variant="contained" startIcon={<Refresh />} onClick={handleReset}>
                    RESET
                </Button>
            </Box>

            <Typography variant="h6" sx={{ mt: 3 }}>SQL Result</Typography>
            <pre style={{ textAlign: "left", background: "#f4f4f4", padding: "10px", borderRadius: "5px" }}>
                {JSON.stringify(result, null, 2)}
            </pre>
            {error && <Typography color="error">Error: {typeof error === "string" ? error : JSON.stringify(error)}</Typography>}
        </Box>
    );
};

export default SQLExecutor;

import {AuthenticationPlugin} from "./authentication";
import {Env, getEnvOrNotDefined, getEnvOrThrow} from "@itsmworkbench/utils";

export type ApiKeyAuthentication = {
    method: "ApiKey";
    credentials: {
        // The API key is provided as an environment variable name.
        apiKey: string;
    };
};
export const apiKeyAuthenticationPlugin: AuthenticationPlugin<ApiKeyAuthentication> = {
    plugin: "authentication",
    validate: (a: any) => {
        const errors: string[] = [];
        if (a.method !== "ApiKey") errors.push("Method must be ApiKey.");
        if (!a.credentials || typeof a.credentials.apiKey !== "string") {
            errors.push("Missing or invalid apiKey.");
        }
        return errors;
    },
    isA: (auth: any): auth is ApiKeyAuthentication => auth?.method === "ApiKey",
    addToHeaders: (env, auth, headers) => ({
        ...headers,
        apikey: getEnvOrThrow(env, auth.credentials.apiKey),
    }),
    modifyUrl: (env: Env, u: string, a: ApiKeyAuthentication) => u,
    variables: (env: Env, a: ApiKeyAuthentication) => ({
        apiKey: getEnvOrNotDefined(env, a.credentials.apiKey),
    }),
};
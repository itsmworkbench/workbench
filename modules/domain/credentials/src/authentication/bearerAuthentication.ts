import {AuthenticationPlugin} from "./authentication";
import {Env, getEnvOrNotDefined, getEnvOrThrow} from "@itsmworkbench/utils";

export type BearerAuthentication = {
    method: "Bearer";
    credentials: {
        // The bearer token is provided as an environment variable name.
        apiKey: string;
    };
};
export const bearerAuthenticationPlugin: AuthenticationPlugin<BearerAuthentication> = {
    plugin: "authentication",
    validate: (a: any) => {
        const errors: string[] = [];
        if (a.method !== "Bearer") errors.push("Method must be Bearer.");
        if (!a.credentials || typeof a.credentials.apiKey !== "string") {
            errors.push("Missing or invalid apiKey.");
        }
        return errors;
    },
    isA: (auth: any): auth is BearerAuthentication => auth?.method === "Bearer",
    addToHeaders: (env, auth, headers) => ({
        ...headers,
        Authorization: `Bearer ${getEnvOrThrow(env, auth.credentials.apiKey)}`,
    }),
    modifyUrl: (env: Env, u: string, a: BearerAuthentication) => u,
    variables: (env: Env, a: BearerAuthentication) => ({
        apiKey: getEnvOrNotDefined(env, a.credentials.apiKey),
    }),
};
import {AuthenticationPlugin, DecryptFn} from "./authentication";
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
    addToHeaders: async (decrypt: DecryptFn, auth, headers) => ({
        ...headers,
        Authorization: `Bearer ${await decrypt(auth.credentials.apiKey)}`,
    }),
    modifyUrl: async (decrypt: DecryptFn, u: string, a: BearerAuthentication) => u,
    variables: async (decrypt: DecryptFn, a: BearerAuthentication) => ({
        apiKey: await decrypt(a.credentials.apiKey),
    }),
};
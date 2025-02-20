import {AuthenticationPlugin, DecryptFn} from "./authentication";
import {Env, getEnvOrNotDefined, getEnvOrThrow} from "@itsmworkbench/utils";

export type PrivateTokenAuthentication = {
    method: "PrivateToken";
    credentials: {
        // The token is provided as an environment variable name.
        token: string;
    };
};
export const privateTokenAuthenticationPlugin: AuthenticationPlugin<PrivateTokenAuthentication> = {
    plugin: "authentication",
    validate: (a: any) => {
        const errors: string[] = [];
        if (a.method !== "PrivateToken") errors.push("Method must be PrivateToken.");
        if (!a.credentials || typeof a.credentials.token !== "string") {
            errors.push("Missing or invalid token.");
        }
        return errors;
    },
    isA: (auth: any): auth is PrivateTokenAuthentication =>
        auth?.method === "PrivateToken",
    addToHeaders: async (decrypt: DecryptFn, auth, headers) => ({
        ...headers,
        "private-token": await decrypt(auth.credentials.token),
    }),
    modifyUrl: async (decrypt: DecryptFn, u: string, a: PrivateTokenAuthentication) => u,
    variables: async (decrypt: DecryptFn, a: PrivateTokenAuthentication) => ({
        token: await decrypt(a.credentials.token),
    }),
};
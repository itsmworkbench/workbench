import {AuthenticationPlugin} from "./authentication";
import {Env, getEnvOrNotDefined, getEnvOrThrow} from "@itsmworkbench/utils";

export type SASAuthentication = {
    method: "SAS";
    credentials: {
        // The SAS token here is provided as the name of an environment variable.
        sasToken: string;
    };
};
export const sasAuthenticationPlugin: AuthenticationPlugin<SASAuthentication> = {
    plugin: "authentication",
    validate: (a: any) => {
        const errors: string[] = [];
        if (a.method !== "SAS") errors.push("Method must be SAS.");
        if (!a.credentials || typeof a.credentials.sasToken !== "string") {
            errors.push("Missing or invalid sasToken.");
        }
        return errors;
    },
    isA: (auth: any): auth is SASAuthentication => auth?.method === "SAS",
    addToHeaders: (env, auth, headers) => headers,
    modifyUrl: (env: Env, u: string, a: SASAuthentication) => {
        // Resolve the SAS token from the environment.
        const token = getEnvOrThrow(env, a.credentials.sasToken);
        const join = u.includes("?") ? "&" : "?";
        return `${u}${join}sasToken=${token}`;
    },
    variables: (env: Env, a: SASAuthentication) => ({
        sasToken: getEnvOrNotDefined(env, a.credentials.sasToken),
    }),
};
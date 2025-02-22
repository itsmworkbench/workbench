import {AuthenticationPlugin, DecryptFn} from "./authentication";
import {Env, getEnvOrNotDefined, getEnvOrThrow} from "@itsmworkbench/utils";
import {lensBuilder} from "@itsmworkbench/optics";
import {ApiKeyAuthentication} from "./apiKeyAuthentication";

export type BasicAuthentication = {
    method: "Basic";
    credentials: {
        // Username is plain text; password is the name of an environment variable.
        username: string;
        password: string;
    };
};
export const basicUsernameL = lensBuilder<BasicAuthentication>().focusOn('credentials').focusOn('username');
export const basicPasswordL = lensBuilder<BasicAuthentication>().focusOn('credentials').focusOn('password');
export const basicAuthenticationPlugin: AuthenticationPlugin<BasicAuthentication> = {
    plugin: "authentication",
    validate: (a: any) => {
        const errors: string[] = [];
        if (a.method !== "Basic") errors.push("Method must be Basic.");
        if (!a.credentials?.username || typeof a.credentials.username !== "string") {
            errors.push("Missing or invalid username.");
        }
        if (!a.credentials?.password || typeof a.credentials.password !== "string") {
            errors.push("Missing or invalid password.");
        }
        return errors;
    },
    isA: (auth: any): auth is BasicAuthentication => auth?.method === "Basic",
    addToHeaders: async (decrypt: DecryptFn, auth, headers) => {
        // For Basic auth, we expect the password to be an environment variable.
        const credentials = `${auth.credentials.username}:${await decrypt(auth.credentials.password)}`;
        const encoded = btoa(credentials);
        return {...headers, Authorization: `Basic ${encoded}`};
    },
    modifyUrl: async (decrypt: DecryptFn, u: string, a: BasicAuthentication) => u,
    variables: async (decrypt: DecryptFn, a: BasicAuthentication) => ({
        username: a.credentials.username,
        password: await decrypt(a.credentials.password),
    }),
    objectDefn: {
        layout: [1, 1,1],
        fields: {
            method: {lens: lensBuilder<BasicAuthentication>().focusOn('method'), editable: false},
            username: {lens: basicUsernameL, fieldType: 'string'},
            password: {lens: basicPasswordL, fieldType: 'encrypted'},
        }
    }
};
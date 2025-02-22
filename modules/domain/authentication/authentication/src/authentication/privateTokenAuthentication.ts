import {AuthenticationPlugin, DecryptFn} from "./authentication";
import {lensBuilder} from "@itsmworkbench/optics";

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
    objectDefn: {
        layout: [1,1],
        fields: {
            method: {lens: lensBuilder<PrivateTokenAuthentication>().focusOn('method'), editable: false},
            token: {lens: lensBuilder<PrivateTokenAuthentication>().focusOn('credentials').focusOn('token'), fieldType: 'encrypted'},
        }
    }
};
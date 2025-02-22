import {AuthenticationPlugin, DecryptFn} from "./authentication";
import {Env, getEnvOrNotDefined, getEnvOrThrow} from "@itsmworkbench/utils";
import {lensBuilder} from "@itsmworkbench/optics";
import {PrivateTokenAuthentication} from "./privateTokenAuthentication";

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
    addToHeaders: async (decrypt, auth, headers) => headers,
    modifyUrl: async (decrypt: DecryptFn, u: string, a: SASAuthentication) => {
        // Resolve the SAS token from the environment.
        const token = await decrypt(a.credentials.sasToken);
        const join = u.includes("?") ? "&" : "?";
        return `${u}${join}sasToken=${token}`;
    },
    variables: async (decrypt: DecryptFn, a: SASAuthentication) => ({
        sasToken: await decrypt(a.credentials.sasToken),
    }),
    objectDefn: {
        layout: [1,1],
        fields: {
            method: {lens: lensBuilder<SASAuthentication>().focusOn('method'), editable: false},
            sasToken: {lens: lensBuilder<SASAuthentication>().focusOn('credentials').focusOn('sasToken'), fieldType: 'string'},
        }
    }
};
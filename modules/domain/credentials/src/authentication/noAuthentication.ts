import {AuthenticationPlugin, DecryptFn} from "./authentication";
import {Env} from "@itsmworkbench/utils";

export type NoAuthentication = {
    method: "none";
};
export const noAuthenticationPlugin: AuthenticationPlugin<NoAuthentication> = {
    plugin: "authentication",
    validate: (a: any) => {
        const errors: string[] = [];
        if (a.method !== "none") errors.push("Method must be none.");
        return errors;
    },
    isA: (auth: any): auth is NoAuthentication => auth?.method === "none",
    addToHeaders: async (decrypt: DecryptFn, auth, headers) => headers,
    modifyUrl: async (decrypt: DecryptFn, u: string, a: NoAuthentication) => u,
    variables: async (decrypt: DecryptFn, a: NoAuthentication) => ({}),
};
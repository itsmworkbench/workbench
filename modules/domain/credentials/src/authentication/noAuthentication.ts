import {AuthenticationPlugin} from "./authentication";
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
    addToHeaders: (env, auth, headers) => headers,
    modifyUrl: (env: Env, u: string, a: NoAuthentication) => u,
    variables: (env: Env, a: NoAuthentication) => ({}),
};
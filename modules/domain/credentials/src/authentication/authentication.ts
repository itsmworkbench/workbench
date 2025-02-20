import {Env, NameAnd} from "@itsmworkbench/utils";
import {ErrorsOr, isErrors} from "@itsmworkbench/errors";

export type AuthenticationPlugsin = NameAnd<AuthenticationPlugin<any>>;
export type AuthenticationPlugin<A> = {
    plugin: "authentication";
    validate: (a: any) => string[];
    isA: (a: any) => a is A;
    addToHeaders: (env: Env, a: A, headers: NameAnd<string>) => NameAnd<string>;
    modifyUrl: (env: Env, u: string, a: A) => string;
    variables: (env: Env, a: A) => NameAnd<string>;
};


export function asAuthentication(plugsin: AuthenticationPlugsin, a: any): ErrorsOr<AuthenticationPlugin<any>> {
    for (const plugin of Object.values(plugsin)) {
        if (plugin.isA(a)) {
            const validationErrors = plugin.validate(a);
            return validationErrors.length === 0
                ? {value: plugin}
                : {errors: validationErrors};
        }
    }
    return {
        errors: [
            `No matching authentication plugin. Legal values are ${Object.keys(
                plugsin
            )}. Authentication is ${JSON.stringify(a, null, 2)}`,
        ],
    };
}

export function asAuthenticationOrThrow(plugsin: AuthenticationPlugsin, a: any): AuthenticationPlugin<any> {
    const result = asAuthentication(plugsin, a);
    if (isErrors(result)) throw new Error(result.errors.join("\n"));
    return result.value;
}
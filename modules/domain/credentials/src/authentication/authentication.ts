import {Env, NameAnd} from "@itsmworkbench/utils";
import {ErrorsOr, isErrors} from "@itsmworkbench/errors";

export type DecryptFn = (encrypted: string) => Promise<string>
export type AuthenticationPlugsin = NameAnd<AuthenticationPlugin<any>>;
export type AuthenticationPlugin<A> = {
    plugin: "authentication";
    validate: (a: any) => string[];
    isA: (a: any) => a is A;
    addToHeaders: (decrypt: DecryptFn, a: A, headers: NameAnd<string>) => Promise<NameAnd<string>>;
    modifyUrl: (decrypt: DecryptFn, u: string, a: A) => Promise<string>;
    variables: (decrypt: DecryptFn, a: A) => Promise<NameAnd<string>>;
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
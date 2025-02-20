import {NameAnd} from "./name.and";

export type Env = NameAnd<string | undefined>

export function getEnvOrThrow(env: Env, key: string): string {
    const value = env[key];
    if (value === undefined) {
        throw new Error(`Environment variable ${key} is not defined`);
    }
    return value;
}

export function getEnvOrNotDefined(env: Env, key: string): string {
    const value = env[key];
    return value === undefined ? "<Not Defined>" : value;
}
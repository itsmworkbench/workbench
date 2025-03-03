import {ErrorsOr} from "@itsmworkbench/errors";

export type Parser<T> = (context: string) => (s: string) => ErrorsOr<T>

export const JsonParser: Parser<any> = (context: string) => (s: string) => {
    try {
        return {value: JSON.parse(s)}
    } catch (e) {
        return {errors: [e]}
    }
}
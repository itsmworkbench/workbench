import {NameAnd} from "@itsmworkbench/utils";

export type ErrorsOr<T> = Errors | Value<T>;
export type Value<T> = { value: T };
export type Errors = { errors: string[], reference?: string, extras?: any };

// Custom Exception for structured error handling
export class ErrorsException extends Error {
    constructor(public errors: string[], public reference?: string) {
        super(errors.join(', '));
        this.name = 'ErrorsException';
    }
}

export function isValue<T>(e: ErrorsOr<T>): e is Value<T> {
    return 'value' in e;
}

export function isErrors<T>(e: ErrorsOr<T>): e is Errors {
    return (e as any).errors !== undefined;
}

// Throw exception if errors are present
export function valueOrThrow<T>(e: ErrorsOr<T>): T {
    if (isErrors(e)) throw new ErrorsException(e.errors, e.reference);
    return e.value;
}

// Return default if errors exist
export const valueOrDefault = <T>(e: ErrorsOr<T>, defaultValue: T): T =>
    isErrors(e) || !e ? defaultValue : e.value;

// Partition values and errors from NameAnd structure
export function partitionNameAndErrorsOr<T>(es: NameAnd<ErrorsOr<T>>) {
    const values: NameAnd<T> = {};
    const errors: string[] = [];
    for (const [name, value] of Object.entries(es)) {
        if (isValue(value)) values[name] = value.value;
        else errors.push(...value.errors);
    }
    return { values, errors };
}

// Extract errors or throw if a value is unexpectedly present
export function errorsOrThrow<T>(e: ErrorsOr<T>): Errors {
    if (isValue(e)) throw new ErrorsException([`Expected errors but got value ${JSON.stringify(e)}`]);
    return e;
}

// Apply mapping over ErrorsOr, preserving errors
export function mapErrorsOr<T, T1>(e: ErrorsOr<T>, f: (t: T) => T1): ErrorsOr<T1> {
    if (isValue(e)) return { value: f(e.value) };
    return e;
}

// Apply flatMap over ErrorsOr, preserving errors
export function flatMapErrorsOr<T, T1>(e: ErrorsOr<T>, f: (t: T) => ErrorsOr<T1>): ErrorsOr<T1> {
    if (isValue(e)) return f(e.value);
    return e;
}

// Async mapping over ErrorsOr
export async function mapErrorsOrK<T, T1>(e: ErrorsOr<T>, f: (t: T) => Promise<T1>): Promise<ErrorsOr<T1>> {
    if (isValue(e)) return { value: await f(e.value) };
    return e;
}

// Async flatMap over ErrorsOr
export async function flatMapErrorsOrK<T, T1>(e: ErrorsOr<T>, f: (t: T) => Promise<ErrorsOr<T1>>): Promise<ErrorsOr<T1>> {
    if (isValue(e)) return await f(e.value);
    return e;
}

// Error recovery with fallback handling
export function recover<T>(e: ErrorsOr<T>, f: (e: Errors) => T): T {
    if (isErrors(e)) return f(e);
    return e.value;
}

// Type definitions for async functions returning ErrorsOr
export type AsyncErrorCall<From, To> = (from: From) => Promise<ErrorsOr<To>>;
export type AsyncErrorCall2<From1, From2, To> = (from1: From1, from2: From2) => Promise<ErrorsOr<To>>;

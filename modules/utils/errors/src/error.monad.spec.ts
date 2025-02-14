

// Utility functions for test setup
import {Errors, ErrorsException, errorsOrThrow, flatMapErrorsOr, flatMapErrorsOrK, isErrors, isValue, mapErrorsOr, mapErrorsOrK, recover, Value, valueOrThrow} from "./error.monad";

const createValue = <T>(value: T): Value<T> => ({ value });
const createErrors = (errors: string[], reference?: string): Errors => ({ errors, reference });

describe("ErrorsOr Utility Functions", () => {

    describe("valueOrThrow", () => {
        it("returns value when passed Value<T>", () => {
            const result = valueOrThrow(createValue("test"));
            expect(result).toBe("test");
        });

        it("throws ErrorsException when passed Errors", () => {
            const errors = createErrors(["Error 1", "Error 2"], "ref123");
            expect(() => valueOrThrow(errors)).toThrow(ErrorsException);
            expect(() => valueOrThrow(errors)).toThrow("Error 1, Error 2");
        });
    });

    describe("errorsOrThrow", () => {
        it("returns Errors when passed Errors", () => {
            const errors = createErrors(["Critical failure"]);
            const result = errorsOrThrow(errors);
            expect(result.errors).toContain("Critical failure");
        });

        it("throws ErrorsException if passed Value<T>", () => {
            const value = createValue(42);
            expect(() => errorsOrThrow(value)).toThrow(ErrorsException);
            expect(() => errorsOrThrow(value)).toThrow('Expected errors but got value {"value":42}');
        });
    });

    describe("isValue and isErrors", () => {
        it("correctly identifies Value<T>", () => {
            const value = createValue(99);
            expect(isValue(value)).toBe(true);
            expect(isErrors(value)).toBe(false);
        });

        it("correctly identifies Errors", () => {
            const errors = createErrors(["Something went wrong"]);
            expect(isValue(errors)).toBe(false);
            expect(isErrors(errors)).toBe(true);
        });
    });

    describe("mapErrorsOr", () => {
        it("transforms value when Value<T> is passed", () => {
            const value = createValue(5);
            const result = mapErrorsOr(value, (x) => x * 2);
            expect(result).toEqual({ value: 10 });
        });

        it("preserves Errors when passed", () => {
            const errors = createErrors(["Failure"]);
            const result = mapErrorsOr(errors, (x) => x);
            expect(result).toBe(errors);
        });
    });

    describe("flatMapErrorsOr", () => {
        it("flat maps to new ErrorsOr value", () => {
            const value = createValue(3);
            const result = flatMapErrorsOr(value, (x) =>
                x > 2 ? createValue("Success") : createErrors(["Too small"])
            );
            expect(result).toEqual({ value: "Success" });
        });

        it("returns Errors unchanged", () => {
            const errors = createErrors(["Broken"]);
            const result = flatMapErrorsOr(errors, (x) => createValue("Ignored"));
            expect(result).toBe(errors);
        });
    });

    describe("recover", () => {
        it("returns the existing value if no errors", () => {
            const value = createValue("keep");
            const result = recover(value, () => "recovered");
            expect(result).toBe("keep");
        });

        it("recovers from Errors by applying fallback function", () => {
            const errors = createErrors(["Something broke"]);
            const result = recover(errors, (e) => `Recovered: ${e.errors[0]}`);
            expect(result).toBe("Recovered: Something broke");
        });
    });

    describe("mapErrorsOrK (async)", () => {
        it("transforms value asynchronously", async () => {
            const value = createValue(10);
            const result = await mapErrorsOrK(value, async (x) => x + 1);
            expect(result).toEqual({ value: 11 });
        });

        it("preserves Errors asynchronously", async () => {
            const errors = createErrors(["Async failure"]);
            const result = await mapErrorsOrK(errors, async (x) => x);
            expect(result).toBe(errors);
        });
    });

    describe("flatMapErrorsOrK (async)", () => {
        it("flat maps asynchronously to new ErrorsOr", async () => {
            const value = createValue(7);
            const result = await flatMapErrorsOrK(value, async (x) =>
                x > 5 ? createValue("Async success") : createErrors(["Too small"])
            );
            expect(result).toEqual({ value: "Async success" });
        });

        it("returns Errors without calling async function", async () => {
            const errors = createErrors(["Async error"]);
            const asyncFunc = jest.fn().mockResolvedValue(createValue("Won't run"));
            const result = await flatMapErrorsOrK(errors, asyncFunc);
            expect(result).toBe(errors);
            expect(asyncFunc).not.toHaveBeenCalled();
        });
    });
});

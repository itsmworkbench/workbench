import {Env, NameAnd} from "@itsmworkbench/utils";
import {AuthenticationPlugin} from "./authentication";

export type AuthTestDetails<A> = {
    auth: A;
    env: Env; // valid environment values
    expectedHeaders: NameAnd<string>;
    expectedUrl: (u: string) => string;
    headerThrowsWhenEnvEmpty?: string;
    urlThrowsWhenEnvEmpty?: string;
};

export type TestA<A> = {
    plugin: AuthenticationPlugin<A>
    valid: NameAnd<AuthTestDetails<A>>;
    invalid: A[];
};

export function runAuthTests<A>(testConfig: TestA<A>): void {
    describe(`Authentication Plugin: ${testConfig.plugin.plugin}`, () => {
        // For each valid test detail...
        Object.entries(testConfig.valid).forEach(([name, details]) => {
            describe(`Valid test case: ${name}`, () => {
                it("should validate without errors", () => {
                    const errors = testConfig.plugin.validate(details.auth);
                    expect(errors).toHaveLength(0);
                });

                it("should add headers correctly", () => {
                    const updatedHeaders = testConfig.plugin.addToHeaders(details.env, details.auth, {});
                    expect(updatedHeaders).toEqual(details.expectedHeaders);

                });

                it("should modify the URL correctly with valid env", () => {
                    const baseUrl = "http://example.com/api";
                    const modifiedUrl = testConfig.plugin.modifyUrl(details.env, baseUrl, details.auth);
                    const expectedUrl = details.expectedUrl(baseUrl);
                    expect(modifiedUrl).toEqual(expectedUrl);
                });

                it("should return proper variables with valid env", () => {
                    const vars = testConfig.plugin.variables(details.env, details.auth);
                    // For each returned variable, we at least check it's a string.
                    Object.values(vars).forEach((value) => {
                        expect(typeof value).toBe("string");
                    });
                });

                if (details.urlThrowsWhenEnvEmpty) {
                    it("should throw an error for modifyUrl when env is empty", () => {
                        expect(() => {
                            testConfig.plugin.modifyUrl({}, "http://example.com/api", details.auth);
                        }).toThrow(details.urlThrowsWhenEnvEmpty);
                    });
                }

                if (details.headerThrowsWhenEnvEmpty) {
                    it("should return expected values for variables when env is empty", () => {
                        expect(() => testConfig.plugin.addToHeaders({}, details.auth, {})).toThrow(details.headerThrowsWhenEnvEmpty);
                    });
                }
            });
        });

        // Invalid cases
        testConfig.invalid.forEach((invalidAuth, index) => {
            it(`should fail validation for invalid case #${index + 1}: ${JSON.stringify(invalidAuth)}`, () => {
                const errors = testConfig.plugin.validate(invalidAuth);
                expect(errors.length).toBeGreaterThan(0);
            });
        });
    });
}

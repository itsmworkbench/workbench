import {Env, NameAnd} from "@itsmworkbench/utils";
import {AuthenticationPlugin, DecryptFn} from "./authentication";

export type AuthTestDetails<A> = {
    auth: A;
    env: Env; // valid environment values
    expectedHeaders: NameAnd<string>;
    expectedUrl: (u: string) => string;
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
            const decrypt: DecryptFn = async (value: string) => details.env[value]
            describe(`Valid test case: ${name}`, () => {
                it("should validate without errors", () => {
                    const errors = testConfig.plugin.validate(details.auth);
                    expect(errors).toHaveLength(0);
                });

                it("should add headers correctly", async () => {
                    const updatedHeaders = await testConfig.plugin.addToHeaders(decrypt, details.auth, {});
                    expect(updatedHeaders).toEqual(details.expectedHeaders);

                });

                it("should modify the URL correctly with valid env", async () => {
                    const baseUrl = "http://example.com/api";
                    const modifiedUrl = await testConfig.plugin.modifyUrl(decrypt, baseUrl, details.auth);
                    const expectedUrl = details.expectedUrl(baseUrl);
                    expect(modifiedUrl).toEqual(expectedUrl);
                });

                it("should return proper variables with valid env", async () => {
                    const vars = await testConfig.plugin.variables(decrypt, details.auth);
                    // For each returned variable, we at least check it's a string.
                    Object.values(vars).forEach((value) => {
                        expect(typeof value).toBe("string");
                    });
                });


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

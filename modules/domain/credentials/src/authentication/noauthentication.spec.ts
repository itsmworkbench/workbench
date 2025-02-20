import {runAuthTests, TestA} from "./authentication.fixture";
import {NoAuthentication, noAuthenticationPlugin} from "./noAuthentication";

export const testNoAuthConfig: TestA<NoAuthentication> = {
    plugin: noAuthenticationPlugin,
    valid: {
        "NoAuthentication Valid": {
            auth: {method: "none"},
            // Even though env is not used, we provide a valid one:
            env: {SOME_VAR: "some value"},
            expectedHeaders: {},
            // Expected URL remains unchanged
            expectedUrl: (u: string) => u,
            // Since no env lookups occur, we do not expect errors when env is empty.
            // headerThrowsWhenEnvEmpty and urlThrowsWhenEnvEmpty can be left undefined.
        },
    },
    // For invalid cases, provide an object that fails validation.
    invalid: [
        {method: "invalid"} as any, // This should fail because method !== "none"
    ],
};

describe("NoAuthentication Plugin Tests", () => {
    runAuthTests(testNoAuthConfig);
});
import {runAuthTests, TestA} from "./authentication.fixture";

import {BearerAuthentication, bearerAuthenticationPlugin} from "./bearerAuthentication";

export const testBearerAuthConfig: TestA<BearerAuthentication> = {
    plugin: bearerAuthenticationPlugin,
    valid: {
        "Valid Bearer": {
            auth: {method: "Bearer", credentials: {apiKey: "MY_BEARER"}},
            // Environment providing a valid value for MY_BEARER.
            env: {MY_BEARER: "bearer_secret"},
            expectedHeaders: {Authorization: "Bearer bearer_secret"},
            // Expected URL remains unchanged.
            expectedUrl: (u: string) => u,
        },
    },
    invalid: [
        // Invalid case: Missing apiKey in credentials.
        {method: "Bearer", credentials: {}} as any,
        // Invalid case: Wrong method value.
        {method: "NotBearer", credentials: {apiKey: "MY_BEARER"}} as any,
    ],
};

describe("Bearer  authentication Plugin Tests", () => {
    runAuthTests(testBearerAuthConfig);
});
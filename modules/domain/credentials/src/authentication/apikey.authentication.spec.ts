import {runAuthTests, TestA} from "./authentication.fixture";

import {ApiKeyAuthentication, apiKeyAuthenticationPlugin} from "./apiKeyAuthentication";

export const testApiKeyAuthConfig: TestA<ApiKeyAuthentication> = {
    plugin: apiKeyAuthenticationPlugin,
    valid: {
        "Valid ApiKey": {
            auth: { method: "ApiKey", credentials: { apiKey: "MY_API_KEY" } },
            // Provide an environment where MY_API_KEY exists:
            env: { MY_API_KEY: "super_api_key" },
            expectedHeaders: { "apikey": "super_api_key" },
            // Expected URL remains unchanged:
            expectedUrl: (u: string) => u,

        },
    },
    invalid: [
        // Invalid: credentials are missing
        { method: "ApiKey", credentials: {} } as any,
        // Invalid: wrong method value
        { method: "NotApiKey", credentials: { apiKey: "MY_API_KEY" } } as any,
    ],
};

describe("Apikey  authentication Plugin Tests", () => {
    runAuthTests(testApiKeyAuthConfig);
});
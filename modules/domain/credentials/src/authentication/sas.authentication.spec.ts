import {runAuthTests, TestA} from "./authentication.fixture";
import {SASAuthentication, sasAuthenticationPlugin} from "./SASAuthentication";
import {ApiKeyAuthentication, apiKeyAuthenticationPlugin} from "./apiKeyAuthentication";

export const testApiKeyAuthConfig: TestA<SASAuthentication> = {
    plugin: sasAuthenticationPlugin,
    valid: {
        "Valid ApiKey": {
            auth: {method: "SAS", credentials: {sasToken: "MY_SAS_TOKEN"}},
            // Provide an environment where MY_API_KEY exists:
            env: {MY_SAS_TOKEN: "super_sas"},
            expectedHeaders: {},
            // Expected URL remains unchanged:
            expectedUrl: (u: string) => u + "?sasToken=super_sas",
            // When env is empty, addToHeaders should throw (via getEnvOrThrow), so we expect an error message:
            headerThrowsWhenEnvEmpty: undefined,
            // modifyUrl doesn't depend on env, so we don't expect any error:
            urlThrowsWhenEnvEmpty: "Environment variable MY_SAS_TOKEN is not defined",
        },
    },
    invalid: [
        {} as any,
        {method: "SAS", credentials: {}} as any,
    ],
};

describe("Apikey  authentication Plugin Tests", () => {
    runAuthTests(testApiKeyAuthConfig);
});
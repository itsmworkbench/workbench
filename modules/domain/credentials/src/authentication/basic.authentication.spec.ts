import {runAuthTests, TestA} from "./authentication.fixture";
import {BasicAuthentication, basicAuthenticationPlugin} from "./basicAuthentication";
import {ApiKeyAuthentication, apiKeyAuthenticationPlugin} from "./apiKeyAuthentication";

export const testBasicKeyAuthConfig: TestA<BasicAuthentication> = {
    plugin: basicAuthenticationPlugin,
    valid: {
        "Valid ApiKey": {
            auth: {method: "Basic", credentials: {username: 'someuser', password: 'PASSWORD_ENV'}},
            env: {PASSWORD_ENV: "secret_password"},
            expectedHeaders: {"Authorization": "Basic c29tZXVzZXI6c2VjcmV0X3Bhc3N3b3Jk"},
            expectedUrl: (u: string) => u,
        },
    },
    invalid: [
        {method: "Basic", credentials: {}} as any,
        {method: "Basic", credentials: {username: 'someUserName'}},
        {method: "Basic", credentials: {password: 'somePassword'}},
    ],
};

describe("Basic authentication Plugin Tests", () => {
    runAuthTests(testBasicKeyAuthConfig);
});
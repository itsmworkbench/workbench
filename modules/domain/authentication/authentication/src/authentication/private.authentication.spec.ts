import {runAuthTests, TestA} from "./authentication.fixture";
import {PrivateTokenAuthentication, privateTokenAuthenticationPlugin} from "./privateTokenAuthentication";

export const testPrivateTokenAuthConfig: TestA<PrivateTokenAuthentication> = {
    plugin: privateTokenAuthenticationPlugin,
    valid: {
        "Valid PrivateToken": {
            auth: {method: "PrivateToken", credentials: {token: "MY_TOKEN"}},
            // Environment providing a valid token value.
            env: {MY_TOKEN: "super_secret"},
            // Starting headers (which won't be modified in this plugin).
            expectedHeaders: {"private-token": "super_secret"},
            // Expected URL remains unchanged.
            expectedUrl: (u: string) => u,
        },
    },
    invalid: [
        // Missing credentials.token property.
        {method: "PrivateToken", credentials: {}} as any,
        // Wrong method value.
        {method: "WrongMethod", credentials: {token: "MY_TOKEN"}} as any,
    ],
};
describe("Private authentication Plugin Tests", () => {
    runAuthTests(testPrivateTokenAuthConfig);
});
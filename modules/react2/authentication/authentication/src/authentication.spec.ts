import {applyAuthentication, basicAuthentication, bearerAuthentication, bearerAuthenticationFromFn, emptyAuthentication, testAuthentication} from "./authentication";
import {ServiceRequest} from "@itsmworkbench/service_caller";

describe("Authentication", () => {
    const baseRequest: ServiceRequest<any> = {
        method: 'GET',
        url: "https://api.example.com/data",
        body: JSON.stringify({query: "test"}),
        headers: {"Content-Type": "application/json"}
    };

    describe("emptyAuthentication", () => {
        it("should not modify request", async () => {
            const modifiedRequest = await applyAuthentication(emptyAuthentication, baseRequest);
            expect(modifiedRequest).toEqual(baseRequest);
        });
    });

    describe("testAuthentication", () => {
        it("should add headers, modify URL and body", async () => {
            const modifiedRequest = await applyAuthentication(testAuthentication, baseRequest);

            expect(modifiedRequest.url).toBe("https://api.example.com/data?test=test");
            expect(modifiedRequest.headers).toEqual({
                "Content-Type": "application/json",
                "x-test": "test"
            });
            expect(modifiedRequest.body).toEqual('{"query":"test","test":"test"}');
        });
    });

    describe("basicAuthentication", () => {
        it("should add basic auth header", async () => {
            const auth = basicAuthentication("user", "pass");
            const modifiedRequest = await applyAuthentication(auth, baseRequest);

            const expectedAuthHeader = `Basic ${btoa("user:pass")}`;
            expect(modifiedRequest.headers.Authorization).toBe(expectedAuthHeader);
        });

        it("should validate missing username and password", () => {
            const noUsername = basicAuthentication("", "pass");
            const noPassword = basicAuthentication("user", "");

            expect(noUsername.validate()).toContain("Username must be provided for basic authentication");
            expect(noPassword.validate()).toContain("Password must be provided for basic authentication");
        });
    });

    describe("bearerAuthentication", () => {
        it("should add bearer auth header", async () => {
            const auth = bearerAuthentication("my-secret-token");
            const modifiedRequest = await applyAuthentication(auth, baseRequest);

            expect(modifiedRequest.headers.Authorization).toBe("Bearer my-secret-token");
        });

        it("should validate missing token", () => {
            const noToken = bearerAuthentication("");

            expect(noToken.validate()).toContain("Token must be provided for bearer authentication");
        });
    });

    describe("bearerAuthenticationFromFn", () => {
        it("should add bearer auth header from token function", async () => {
            const tokenFn = jest.fn().mockResolvedValue("dynamic-token");
            const auth = bearerAuthenticationFromFn(tokenFn);

            const modifiedRequest = await applyAuthentication(auth, baseRequest);

            expect(modifiedRequest.headers.Authorization).toBe("Bearer dynamic-token");
            expect(tokenFn).toHaveBeenCalled();
        });

        it("should throw error if token function returns empty", async () => {
            const tokenFn = jest.fn().mockResolvedValue("");
            const auth = bearerAuthenticationFromFn(tokenFn);

            await expect(applyAuthentication(auth, baseRequest)).rejects.toThrow(
                "Token function must return a token for bearer authentication"
            );
        });

        it("should validate missing token function", () => {
            const noTokenFn = bearerAuthenticationFromFn(undefined as any);
            expect(noTokenFn.validate()).toContain("Token function must be provided for bearer authentication");
        });
    });
});

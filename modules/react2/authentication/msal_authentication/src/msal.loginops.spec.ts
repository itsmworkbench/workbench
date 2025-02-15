import {MsalLoginFn} from "./msal.login";
import {AccountInfo, AuthenticationResult, PublicClientApplication} from "@azure/msal-browser";
import {MsalLogout} from "./msal.logout";
import {loginUsingMsal} from "./msal.loginops";
import {createMockDebugLog} from "@itsmworkbench/utils";

describe("loginUsingMsal", () => {
    let mockMsalInstance: jest.Mocked<PublicClientApplication>;
    let debugLog: ReturnType<typeof createMockDebugLog>;

    beforeEach(() => {
        mockMsalInstance = {
            getAllAccounts: jest.fn().mockReturnValue([]),
            setActiveAccount: jest.fn(),
        } as unknown as jest.Mocked<PublicClientApplication>;

        debugLog = createMockDebugLog();
    });


    it("should call the login function with the provided scopes", async () => {
        const mockLogin: MsalLoginFn = jest.fn().mockImplementation(
            (msal) => (scopes: string[], debug) => {
                expect(scopes).toEqual(["user.read", "email"]);
                expect(msal).toBe(mockMsalInstance);
                debug("mock login successful");
                return Promise.resolve({ test: "login success" } as unknown as AuthenticationResult);
            }
        );

        const mockLogout: MsalLogout = { name: "mockLogout", logout: jest.fn() };
        const scopes = ["user.read", "email"];

        const loginHandler = loginUsingMsal({
            msal: mockMsalInstance,
            scopes,
            _msalLogin: mockLogin,
            _msalLogout: mockLogout,
        });

        await loginHandler.login(() => {}, debugLog);

        expect(debugLog).toHaveBeenCalledWith("loginUsingMsal.login");
        expect(mockLogin).toHaveBeenCalledWith(mockMsalInstance);
        expect(debugLog).toHaveBeenCalledWith("loginUsingMsal.login - ended");
    });

    it("should call setActiveAccount if accounts exist during login", async () => {
        const mockAccount: AccountInfo = {
            username: "testUser",
            homeAccountId: "id123",
            environment: "env",
            tenantId: "tenant123",
        } as AccountInfo;
        mockMsalInstance.getAllAccounts.mockReturnValue([mockAccount]);

        const mockLogin: MsalLoginFn = jest.fn().mockImplementation(() =>
            jest.fn().mockResolvedValue(null)  // Return a function that resolves to null
        );

        const loginHandler = loginUsingMsal({
            msal: mockMsalInstance,
            _msalLogin: mockLogin,
        });

        await loginHandler.login(() => {}, debugLog);

        expect(mockMsalInstance.setActiveAccount).toHaveBeenCalledWith(mockAccount);
        expect(mockLogin).toHaveBeenCalled();
    });

    it("should not call setActiveAccount if no accounts exist", async () => {
        mockMsalInstance.getAllAccounts.mockReturnValue([]);
        const mockLogin: MsalLoginFn = jest.fn().mockImplementation(() =>
            jest.fn().mockResolvedValue(null)  // Return a function that resolves to null
        );
        const loginHandler = loginUsingMsal({
            msal: mockMsalInstance,
            _msalLogin: mockLogin,
        });

        await loginHandler.login(() => {}, debugLog);

        expect(mockMsalInstance.setActiveAccount).not.toHaveBeenCalled();
    });

    it("should call the logout function for the first account", async () => {
        const mockAccount: AccountInfo = {
            username: "testUser",
            homeAccountId: "id123",
            environment: "env",
            tenantId: "tenant123",
        } as AccountInfo;
        const mockLogout: MsalLogout = { name: "mockLogout", logout: jest.fn() };
        mockMsalInstance.getAllAccounts.mockReturnValue([mockAccount]);

        const loginHandler = loginUsingMsal({
            _msalLogin: undefined as any,
            msal: mockMsalInstance,
            _msalLogout: mockLogout,
        });

        await loginHandler.logout(() => {}, debugLog);

        expect(mockLogout.logout).toHaveBeenCalledWith(mockMsalInstance, mockAccount);
        expect(debugLog).toHaveBeenCalledWith("loginUsingMsal after logout");
    });

    it("should do nothing if there are no accounts to logout", async () => {
        const mockLogout: MsalLogout = { name: "mockLogout", logout: jest.fn() };
        mockMsalInstance.getAllAccounts.mockReturnValue([]);

        const loginHandler = loginUsingMsal({
            _msalLogin: undefined as any,
            msal: mockMsalInstance,
            _msalLogout: mockLogout,
        });

        await loginHandler.logout(() => {}, debugLog);

        expect(mockLogout.logout).not.toHaveBeenCalled();
    });

    it("should correctly determine if a user is logged in", () => {
        mockMsalInstance.getAllAccounts.mockReturnValue([
            {
                username: "testUser",
                homeAccountId: "id123",
                environment: "env",
                tenantId: "tenant123",
            } as AccountInfo,
        ]);

        const loginHandler = loginUsingMsal({
            _msalLogin: undefined as any,
            _msalLogout: undefined as any,
            msal: mockMsalInstance,
        });

        const userData = loginHandler.userDataGetter();
        expect(userData.loggedIn).toBe(true);
        expect(userData.email).toBe("testUser");

        mockMsalInstance.getAllAccounts.mockReturnValue([]);
        expect(loginHandler.userDataGetter().loggedIn).toBe(false);
    });
});

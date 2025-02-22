import {AccountInfo, PublicClientApplication} from "@azure/msal-browser";
import {chainLogout, clearCacheLogout, MsalLogout, popupLogout, redirectLogout} from "./msal.logout";

describe('MsalLogout methods', () => {
    let mockMsalInstance: jest.Mocked<PublicClientApplication>;
    const mockAccount: AccountInfo = {username: 'testUser'} as any;

    beforeEach(() => {
        mockMsalInstance = {
            logoutPopup: jest.fn(),
            logoutRedirect: jest.fn(),
            clearCache: jest.fn(),
        } as unknown as jest.Mocked<PublicClientApplication>;
    });

    const testLogoutMethod = async (
        logoutMethod: MsalLogout,
        msalMethod: keyof typeof mockMsalInstance,
    ) => {
        await logoutMethod.logout(mockMsalInstance, mockAccount);

        expect(mockMsalInstance[msalMethod]).toHaveBeenCalledTimes(1);
        expect(mockMsalInstance[msalMethod]).toHaveBeenCalledWith({account: mockAccount});
    };

    const testLogoutErrorPropagation = async (
        logoutMethod: MsalLogout,
        msalMethod: keyof typeof mockMsalInstance
    ) => {
        const mockError = new Error('Test error');
        (mockMsalInstance[msalMethod] as jest.Mock).mockRejectedValue(mockError);

        await expect(logoutMethod.logout(mockMsalInstance, mockAccount)).rejects.toThrow(mockError);
    };

    it('should call logoutPopup for popupLogout', async () => {
        await testLogoutMethod(popupLogout, 'logoutPopup');
    });

    it('should propagate errors from logoutPopup in popupLogout', async () => {
        await testLogoutErrorPropagation(popupLogout, 'logoutPopup');
    });

    it('should call logoutRedirect for redirectLogout', async () => {
        await testLogoutMethod(redirectLogout, 'logoutRedirect');
    });

    it('should propagate errors from logoutRedirect in redirectLogout', async () => {
        await testLogoutErrorPropagation(redirectLogout, 'logoutRedirect');
    });

    it('should call clearCache for clearCacheLogout', async () => {
        await testLogoutMethod(clearCacheLogout, 'clearCache');
    });

    it('should propagate errors from clearCache in clearCacheLogout', async () => {
        await testLogoutErrorPropagation(clearCacheLogout, 'clearCache');
    });
});

describe('chainLogout', () => {
    // A "blind" msalInstance mock – no functionality, purely passed for compatibility
    const blindMsalInstance = {} as any;
    const mockAccount: AccountInfo = {username: 'testUser'} as any;

    it('should execute the first successful logout', async () => {
        const logout1: MsalLogout = {
            name: 'logout1',
            logout: async () => { throw new Error('logout1 failed'); },
        };
        const logout2: MsalLogout = {
            name: 'logout2',
            logout: async () => { /* success */ },
        };
        const logout3: MsalLogout = {
            name: 'logout3',
            logout: async () => { throw new Error('logout3 should not be called'); },
        };

        const chained = chainLogout(logout1, logout2, logout3);
        await expect(chained.logout(blindMsalInstance, mockAccount)).resolves.not.toThrow();
    });

    it('should call all methods if they fail and throw the last error', async () => {
        const logout1: MsalLogout = {
            name: 'logout1',
            logout: async () => { throw new Error('logout1 failed'); },
        };
        const logout2: MsalLogout = {
            name: 'logout2',
            logout: async () => { throw new Error('logout2 failed'); },
        };
        const logout3: MsalLogout = {
            name: 'logout3',
            logout: async () => { throw new Error('logout3 failed'); },
        };

        const chained = chainLogout(logout1, logout2, logout3);
        await expect(chained.logout(blindMsalInstance, mockAccount)).rejects.toThrow('logout3 failed');
    });

    it('should stop at the first successful method', async () => {
        const logout1: MsalLogout = {
            name: 'logout1',
            logout: async () => { /* success */ },
        };
        const logout2: MsalLogout = {
            name: 'logout2',
            logout: async () => { throw new Error('logout2 should not be called'); },
        };
        const logout3: MsalLogout = {
            name: 'logout3',
            logout: async () => { throw new Error('logout3 should not be called'); },
        };

        const chained = chainLogout(logout1, logout2, logout3);
        await expect(chained.logout(blindMsalInstance, mockAccount)).resolves.not.toThrow();
    });

    it('should throw an error if all methods fail', async () => {
        const logout1: MsalLogout = {
            name: 'logout1',
            logout: async () => { throw new Error('logout1 failed'); },
        };
        const logout2: MsalLogout = {
            name: 'logout2',
            logout: async () => { throw new Error('logout2 failed'); },
        };
        const logout3: MsalLogout = {
            name: 'logout3',
            logout: async () => { throw new Error('logout3 failed'); },
        };

        const chained = chainLogout(logout1, logout2, logout3);
        await expect(chained.logout(blindMsalInstance, mockAccount)).rejects.toThrow('logout3 failed');
    });
});

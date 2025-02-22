import {chainLogin, fromPreviousRedirectLogin, silentLogin, popupLogin, redirectLogin, noLogin} from './msal.login';
import {AuthenticationResult, PublicClientApplication} from '@azure/msal-browser';
import {createMockDebugLog} from "@itsmworkbench/utils";


describe('chainLogin', () => {
    let msalInstance: PublicClientApplication;
    let debugLog: ReturnType<typeof createMockDebugLog>;

    beforeEach(() => {
        msalInstance = {
            acquireTokenSilent: jest.fn(),
            acquireTokenPopup: jest.fn(),
            acquireTokenRedirect: jest.fn(),
            handleRedirectPromise: jest.fn(),
            setActiveAccount: jest.fn(),
            getAllAccounts: jest.fn().mockReturnValue([{homeAccountId: 'account-id'}]),
        } as unknown as PublicClientApplication;

        debugLog = createMockDebugLog();
    });

    it('returns the first successful login result', async () => {
        (msalInstance.acquireTokenSilent as jest.Mock).mockResolvedValue({
            account: {homeAccountId: 'silent-account'},
        });

        const login = chainLogin(msalInstance, silentLogin, popupLogin);
        const result = await login(['user.read'], debugLog);

        expect(result).toEqual({account: {homeAccountId: 'silent-account'}});
        expect(msalInstance.acquireTokenSilent).toHaveBeenCalledTimes(1);
        expect(debugLog).toHaveBeenCalledWith('trying login method', 'acquireSilent');
        expect(msalInstance.setActiveAccount).toHaveBeenCalledWith({homeAccountId: 'silent-account'});
    });

    it('tries all logins if previous ones fail and returns the first success', async () => {
        (msalInstance.acquireTokenSilent as jest.Mock).mockRejectedValue(new Error('silent failed'));
        (msalInstance.acquireTokenPopup as jest.Mock).mockResolvedValue({
            account: {homeAccountId: 'popup-account'},
        });

        const login = chainLogin(msalInstance, silentLogin, popupLogin);
        const result = await login(['user.read'], debugLog);

        expect(result).toEqual({account: {homeAccountId: 'popup-account'}});
        expect(msalInstance.acquireTokenSilent).toHaveBeenCalledTimes(1);
        expect(msalInstance.acquireTokenPopup).toHaveBeenCalledTimes(1);
        expect(debugLog.debugError).toHaveBeenCalledWith(expect.any(Error), 'Login failed for method: acquireSilent');
    });

    it('returns null if all login methods fail', async () => {
        (msalInstance.acquireTokenSilent as jest.Mock).mockRejectedValue(new Error('silent failed'));
        (msalInstance.acquireTokenPopup as jest.Mock).mockRejectedValue(new Error('popup failed'));

        const login = chainLogin(msalInstance, silentLogin, popupLogin);
        const result = await login(['user.read'], debugLog);

        expect(result).toBeNull();
        expect(debugLog.debugError).toHaveBeenNthCalledWith(1, expect.any(Error), 'Login failed for method: acquireSilent');
        expect(debugLog.debugError).toHaveBeenNthCalledWith(2, expect.any(Error), 'Login failed for method: acquirePopup');
        expect(debugLog.debugError).toHaveBeenNthCalledWith(3, expect.any(Error), 'All acquisition methods failed. acquireSilent, acquirePopup. User is assumed to be not logged in', expect.any(Error));
    });

    it('prioritizes login methods in order', async () => {
        (msalInstance.acquireTokenSilent as jest.Mock).mockResolvedValue({
            account: {homeAccountId: 'silent-account'},
        });
        (msalInstance.acquireTokenPopup as jest.Mock).mockResolvedValue({
            account: {homeAccountId: 'popup-account'},
        });

        const login = chainLogin(msalInstance, silentLogin, popupLogin);
        const result = await login(['user.read'], debugLog);

        expect(result).toEqual({account: {homeAccountId: 'silent-account'}});
        expect(msalInstance.acquireTokenPopup).not.toHaveBeenCalled();
    });

    it('returns null if noLogin is used as the only method', async () => {
        const login = chainLogin(msalInstance, noLogin);
        const result = await login(['user.read'], debugLog);

        expect(result).toBeNull();
    });
});

describe('Individual MsalLogin methods', () => {
    let msalInstance: PublicClientApplication;

    beforeEach(() => {
        msalInstance = {
            acquireTokenSilent: jest.fn(),
            acquireTokenPopup: jest.fn(),
            acquireTokenRedirect: jest.fn(),
            handleRedirectPromise: jest.fn(),
        } as unknown as PublicClientApplication;
    });

    it('calls handleRedirectPromise for fromPreviousRedirectLogin', async () => {
        (msalInstance.handleRedirectPromise as jest.Mock).mockResolvedValue(null);
        const result = await fromPreviousRedirectLogin.login([], createMockDebugLog())(msalInstance);

        expect(msalInstance.handleRedirectPromise).toHaveBeenCalledTimes(1);
        expect(result).toBeNull();
    });

    it('calls acquireTokenSilent for silentLogin', async () => {
        const mockResult = {
            account: {homeAccountId: 'silent-account'},
        } as AuthenticationResult;

        (msalInstance.acquireTokenSilent as jest.Mock).mockResolvedValue(mockResult);
        const result = await silentLogin.login(['user.read'], createMockDebugLog())(msalInstance);

        expect(msalInstance.acquireTokenSilent).toHaveBeenCalledWith({scopes: ['user.read']});
        expect(result).toEqual(mockResult);
    });

    it('calls acquireTokenPopup for popupLogin', async () => {
        const mockResult = {
            account: {homeAccountId: 'popup-account'},
        } as AuthenticationResult;

        (msalInstance.acquireTokenPopup as jest.Mock).mockResolvedValue(mockResult);
        const result = await popupLogin.login(['user.read'], createMockDebugLog())(msalInstance);

        expect(msalInstance.acquireTokenPopup).toHaveBeenCalledWith({scopes: ['user.read'], prompt: 'select_account'});
        expect(result).toEqual(mockResult);
    });

    it('calls acquireTokenRedirect for redirectLogin and resolves to null', async () => {
        const result = await redirectLogin.login(['user.read'], createMockDebugLog())(msalInstance);

        expect(msalInstance.acquireTokenRedirect).toHaveBeenCalledWith({
            scopes: ['user.read'],
            prompt: 'select_account',
        });
        expect(result).toBeNull();
    });
});

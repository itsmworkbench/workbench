import {AuthenticationResult, PublicClientApplication} from "@azure/msal-browser";
import {DebugLog} from "@itsmworkbench/utils";


export type MsalLogin = {
    name: string;
    login: (scopes: string[], debug: DebugLog) => (msal: PublicClientApplication) => Promise<AuthenticationResult | null>;
};


export const fromPreviousRedirectLogin: MsalLogin = {
    name: "acquireFromRedirect",
    login: () => async (msal) => msal.handleRedirectPromise(),
};

export const silentLogin: MsalLogin = {
    name: "acquireSilent",
    login: scopes => msal => msal.acquireTokenSilent({scopes}),
};

export const popupLogin: MsalLogin = {
    name: "acquirePopup",
    login: scopes => msal =>
        msal.acquireTokenPopup({scopes, prompt: "select_account",}),
};

export const redirectLogin: MsalLogin = {
    name: "acquireRedirect",
    login: scopes => async msal => {
        await msal.acquireTokenRedirect({scopes, prompt: "select_account",});
        return Promise.resolve(null); // This will never resolve due to redirect
    },
};

export const noLogin: MsalLogin = {
    name: "noLogin",
    login: () => async () => null,
}
export type MsalLoginFn = (msal: PublicClientApplication) => (scopes: string[], debugLog: DebugLog) => Promise<AuthenticationResult | null>;

export const msalLogin: MsalLoginFn =
    (msal: PublicClientApplication) =>
        chainLogin(msal, fromPreviousRedirectLogin, silentLogin, popupLogin, redirectLogin);


export const msalRefreshLogin: MsalLoginFn =
    (msal: PublicClientApplication) =>
        chainLogin(msal, fromPreviousRedirectLogin, silentLogin, noLogin);

/**
 * Chains multiple MsalLogin methods into a single strategy.
 * Attempts each method in order until one succeeds or all fail.
 * Logs the first success or the last failure for debugging.
 */
export function chainLogin(msal: PublicClientApplication, ...logins: MsalLogin[]): (scopes: string[], debug: DebugLog) => Promise<AuthenticationResult | null> {
    let lastError: any = undefined
    return async (scopes, debug) => {
        for (const acquire of logins) {
            lastError = undefined
            try {
                debug('trying login method', acquire.name)
                const result = await acquire.login(scopes, debug)(msal);
                if (result) {
                    debug(`Login succeeded with method: ${acquire.name}`);
                    msal.setActiveAccount(result.account);
                    return result;
                }
            } catch (e: any) {
                debug.debugError(e, `Login failed for method: ${acquire.name}`);
                //we expect errors, if for example we are doing a popup on a mobile... so we just remember the last error
                lastError = e
            }
        }

        const names = logins.map(a => a.name).join(", ");
        if (lastError) //Note that debug.debugError only reports the error when the debug is enabled. Usually this is silent as it isn't actually an error just a 'the way things are'
            debug.debugError(lastError, `All acquisition methods failed. ${names}. User is assumed to be not logged in`, lastError);
        debug(`All acquisition methods failed. ${names}. User is assumed to be not logged in`);
        return null;
    }
}

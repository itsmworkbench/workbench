import {AccountInfo, PublicClientApplication} from "@azure/msal-browser";

export type MsalLogout = {
    name: string;
    logout: (msal: PublicClientApplication, account: AccountInfo) => Promise<void>;
};

export const popupLogout: MsalLogout = {
    name: "logoutPopup",
    logout: (msal, account) => msal.logoutPopup({account}),
}

export const redirectLogout: MsalLogout = {
    name: "logoutRedirect",
    logout: async (msal, account) =>
         msal.logoutRedirect({account})
}

export const clearCacheLogout: MsalLogout = {
    name: "clearCache",
    logout: (msal, account) => msal.clearCache({account}),
};


export const msalLogout: MsalLogout =
    chainLogout(popupLogout, redirectLogout, clearCacheLogout);

/**
 * Chains multiple MsalLogout methods into a single strategy.
 * Attempts each method in order until one succeeds or all fail.
 * Logs the first success or the last failure for debugging.
 */
export function chainLogout(...logins: MsalLogout[]):MsalLogout {
    let lastError: any = undefined
    return {
        name: logins.map(l => l.name).join(" -> "),
        logout: async (msal, account) => {
            for (const login of logins) {
                try {
                    await login.logout(msal, account);
                    console.log(`Logout succeeded with ${login.name}`);
                    return;
                } catch (e) {
                    lastError = e;
                }
            }
            throw lastError;
        }
    }
}

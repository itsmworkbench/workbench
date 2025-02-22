import {PublicClientApplication} from "@azure/msal-browser";
import {msalLogin, MsalLoginFn, msalRefreshLogin} from "./msal.login";
import {MsalLogout, msalLogout} from "./msal.logout";
import {UserData, UserDataGetter} from "@itsmworkbench/login";
import {LoginConfig, LoginOutFn} from "@itsmworkbench/react_login_component";


/**
 * Creates an MSAL-based login handler.
 * @param msalInstance - The MSAL PublicClientApplication instance.
 * @param scopes - The scopes to request during login. Defaults to ["openid", "profile", "user.read", "offline_access"].
 */
type MsalLoginConfig = {
    msal: PublicClientApplication;
    scopes?: string[];
    _msalLogin?: MsalLoginFn
    _msalLogout?: MsalLogout,

}

/**
 * Configuration for MSAL-based login handler.
 * @property msal - The MSAL PublicClientApplication instance.
 * @property scopes - The scopes to request during login. Defaults to ["openid", "profile", "user.read", "offline_access"].
 * @property _msalLogin - The login function to use. Defaults to `msalLogin`. Only override if you know what you're doing (i.e. testing)
 * @property _msalLogout - The logout function to use. Defaults to `msalLogout`. Only override if you know what you're doing (i.e. testing)
 */
export function loginUsingMsal({
                                   msal,
                                   scopes = ["openid", "profile", "user.read", "offline_access"],
                                   _msalLogin = msalLogin,
                                   _msalLogout = msalLogout,

                               }: MsalLoginConfig): LoginConfig {
    const login: LoginOutFn = async (callback, debug) => {
        debug('loginUsingMsal.login')
        const accounts = msal.getAllAccounts();
        const account0 = accounts[0];
        if (account0) msal.setActiveAccount(account0);
        await _msalLogin(msal)(scopes, debug);
        callback()
        debug('loginUsingMsal.login - ended')
    };
    const logout: LoginOutFn = async (callback, debug) => {
        const accounts = msal.getAllAccounts();
        const account = accounts[0];
        if (!account) {
            return;
        }
        await _msalLogout.logout(msal, account)
        debug('loginUsingMsal after logout')
        callback();
        debug('loginUsingMsal after callback')
    };

    const refeshLogin: LoginOutFn = async (callback, debug) => {
        debug('loginUsingMsal.refeshLogin')
        await msalRefreshLogin(msal)(scopes, debug)
        callback()
        debug('loginUsingMsal.refeshLogin - ended')
    };

    const userDataGetter: UserDataGetter = () => {
        const accounts = msal.getAllAccounts();
        const account = accounts[0];
        const loggedIn = !!account;
        const email = account ? account.username : '';
        const isDev = window.location.href.includes("devMode=true"); // the jwt token SHOULD hold this data but currently doesn't so we fake it here
        const isAdmin = window.location.href.includes("admin=true");
        const userData: UserData = {email, isDev, isAdmin, loggedIn};
        return userData;
    }
    return {login, logout, refreshLogin: refeshLogin, userDataGetter};
}



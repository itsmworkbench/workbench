import {LoadingOr} from "@itsmworkbench/loading";
import {delay} from "@itsmworkbench/utils";
import React, {ReactNode, useCallback} from "react";
import {useLoginComponents} from "./react.login";
import {useDebug} from "@itsmworkbench/react_utils";
import {authenticateDebug, useLogin, useUserData} from "./authentication.provider";
import {LoginOpsFn} from "@itsmworkbench/login";


export type RefreshLoginStrategy = (refreshLogin: LoginOpsFn) => LoginOpsFn;

export type AuthenticateProps = {
    children: React.ReactNode
    _refreshLogin?: (refreshLogin: LoginOpsFn) => LoginOpsFn

};

export const delayedRefreshLogin: RefreshLoginStrategy = (refreshLogin: LoginOpsFn): LoginOpsFn =>
    async (): Promise<void> => {
        await delay(1000)
        await refreshLogin()
    };

/** When we load the page we need to refresh any logged in tokens for authenticating.
 * If we set notLoggedIn then we will show the notLoggedIn component until we have refreshed the login.
 * */
export function Authenticate({children = null, _refreshLogin = delayedRefreshLogin}: AuthenticateProps) {
    const {refreshLogin} = useLogin();
    const {NotLoggedIn} = useLoginComponents();
    const kleisli: () => Promise<void> = useCallback(_refreshLogin(refreshLogin), [refreshLogin, _refreshLogin])
    return <LoadingOr kleisli={kleisli} input={undefined}>{() =>
        NotLoggedIn ? <MustBeLoggedIn renderNotLoggedIn={NotLoggedIn}>{children}</MustBeLoggedIn> : children
    }</LoadingOr>
}

export type MustBeLoggedInProps = {
    renderNotLoggedIn: () => ReactNode,
    children: ReactNode
};

export type MustBeLoggedInDisplay = (props: MustBeLoggedInProps) => React.ReactElement;

export function MustBeLoggedIn({children, renderNotLoggedIn}: MustBeLoggedInProps): ReactNode {
    const userData = useUserData()
    const debug = useDebug(authenticateDebug)
    debug('MustBeLoggedIn', userData)
    return (
        <MustBeLoggedInWrapper
            loggedIn={userData?.loggedIn}
            children={children}
            notLoggedIn={renderNotLoggedIn}
        />
    );
}

// The wrapper that decides which content to show
function MustBeLoggedInWrapper({
                                   loggedIn,
                                   children,
                                   notLoggedIn,
                               }: {
    loggedIn: boolean;
    children: ReactNode;
    notLoggedIn: () => ReactNode;
}) {
    // We do not conditionally skip any hooks here.
    // If we had more hooks, they'd always be called.

    // We only conditionally show different content.
    if (loggedIn) {
        // If children is a component that uses hooks, that's fine,
        // we always render children in the "loggedIn" path consistently
        return <>{children}</>;
    } else {
        // If notLoggedIn uses hooks, it is always used in the "loggedOut" path consistently
        return <>{notLoggedIn()}</>;
    }
}

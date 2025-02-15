import {DisplayLogin, DisplayLoginProps} from "./react.login";

import React, {ReactElement} from "react";
import {useLogin, useUserData} from "./authentication.provider";
import {useThrowError} from "@itsmworkbench/react_utils";

function getUserRoleString(isAdmin: boolean, isDev: boolean): string {
    return `${isAdmin ? ' - Admin' : ''}${isDev ? ' - Dev' : ''}`;
}

export const SimpleDisplayLogin: DisplayLogin = (props: DisplayLoginProps) => {
    const {login, logout} = useLogin()
    const userData = useUserData()
    const {loggedIn, email, isAdmin, isDev} = userData
    return <div>
        {loggedIn ? <div>
            <div>Logged in as {email}{getUserRoleString(isAdmin, isDev)}</div>
            <button onClick={logout}>Logout</button>
        </div> : <button onClick={login}>Login</button>}
    </div>
};

export function SimpleNotLoggedIn(): ReactElement {
    const {login} = useLogin()
    const {loggedIn} = useUserData()
    const throwError = useThrowError()
    if (loggedIn) return throwError('s/w', 'Must not be logged in to use SimpleNotLoggedIn')
    return <div>Must be logged in
        <button onClick={login}>Login</button>
    </div>;
}

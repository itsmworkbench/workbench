import {makeContextFor} from "@itsmworkbench/react_utils";
import {allAuthentication, authenticationFromNameSpace, AuthenticationPlugins, AuthFn} from "@itsmworkbench/authentication";
import {useUrlStore} from "@itsmworkbench/reacturlstore";
import React, {useCallback} from "react";

export const {use: useAuthenticationPlugins, Provider: AuthenticationPluginsProvider} = makeContextFor<AuthenticationPlugins, 'authenticationPlugins'>('authenticationPlugins', allAuthentication)

export const {use: useAuthFn, Provider: RawAuthFnProvider} = makeContextFor<AuthFn, 'authFn'>('authFn')

export type AuthFnProviderProps = {
    organisation?: string
    children: React.ReactNode
}

export function AuthFnProviderFromUrlStore({children, organisation = 'me'}: AuthFnProviderProps) {
    const urlStore = useUrlStore()
    const authPlugins = useAuthenticationPlugins()
    const authFn = useCallback(authenticationFromNameSpace(organisation, urlStore, authPlugins), [urlStore, authPlugins])
    return <RawAuthFnProvider authFn={authFn}>{children}</RawAuthFnProvider>
}
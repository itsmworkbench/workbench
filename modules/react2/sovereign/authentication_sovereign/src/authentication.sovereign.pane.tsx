import {makeSovereignStatePlugin} from "@itsmworkbench/sovereign";
import React, {useCallback} from "react";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useUrlStore} from "@itsmworkbench/reacturlstore";
import {useSecretData} from "@itsmworkbench/secrets";
import {mapAsync, NameAnd} from "@itsmworkbench/utils";
import {UrlQuery, UrlStore} from "@itsmworkbench/urlstore";
import {Kleisli, useKleisli} from "@itsmworkbench/loading";
import {ErrorsAnd, hasErrors} from "@laoban/utils";
import {Authentication} from "@itsmworkbench/login";
import {asAuthentication, authenticationNameSpace, AuthFn, AuthFnResult, hasEnteredPassword} from "@itsmworkbench/authentication";
import {useViewComponents, ViewObjectFromDefn} from "@itsmworkbench/viewobject";
import {useAuthenticationPlugins, useAuthFn} from "@itsmworkbench/react_authentication";
import {ErrorsOr, isErrors} from "@itsmworkbench/errors";
import {useRenderers} from "@itsmworkbench/renderers";


export type AuthenticationProps = {
    org: string
}

export const loadAuthentication = (urlStore: UrlStore, authFn: AuthFn): Kleisli<string, NameAnd<ErrorsOr<AuthFnResult<any>>>> => {
    return async (org) => {
        const query: UrlQuery = {
            org,
            namespace: authenticationNameSpace,
            pageQuery: {page: 1},
            order: "name",
        }
        const names = await urlStore.list(query)
        if (hasErrors(names)) throw new Error(names.join("\n"))
        const result: NameAnd<ErrorsAnd<AuthFnResult<any>>> = {}
        const res: NameAnd<ErrorsOr<AuthFnResult<any>>> = Object.fromEntries(await mapAsync(names.names,
            async name => ([name, await authFn(name)])));
        return res
    };
}

export function Authentication({org}: AuthenticationProps) {
    const urlStore = useUrlStore()
    const [secretData] = useSecretData()
    const authFn = useAuthFn()
    const loader = useCallback(loadAuthentication(urlStore, authFn), [urlStore, authFn]);
    const {data, loading, error} = useKleisli(loader, org)
    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>
    const rootId = 'authentication';
    if (!hasEnteredPassword(secretData)) return <div>Need to set password</div>
    return <>{Object.entries(data).map(([name, authRes]) => {
        return <><h1>{name}</h1>{isErrors(authRes)
            ? <div>{authRes.errors.join("\n")}</div>
            : <ViewObjectFromDefn rootId={rootId} main={authRes.value.auth} objectDefn={authRes.value.authPlugin.objectDefn}/>}</>
    })}</>
}


export function AuthenticationSovereignPane() {
    let org = 'me';
    return <Authentication org={org}/>
}

export const AuthenticationSovereignPagePlugin = makeSovereignStatePlugin(AuthenticationSovereignPane)


import {makeSovereignStatePlugin} from "@itsmworkbench/sovereign";
import React, {useCallback} from "react";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useUrlStore} from "@itsmworkbench/reacturlstore";
import {useSecretData} from "@itsmworkbench/secrets";
import {mapAsync, NameAnd} from "@itsmworkbench/utils";
import {NamedUrl, UrlQuery, UrlStore} from "@itsmworkbench/urlstore";
import {Kleisli, useKleisli} from "@itsmworkbench/loading";
import {ErrorsAnd, hasErrors, mapErrors} from "@laoban/utils";
import {Authentication} from "@itsmworkbench/login";
import {useAttributeEditorComponents} from "@itsmworkbench/editors";
import {authenticationNameSpace, hasEnteredPassword, hasPassword} from "@itsmworkbench/authentication";
import {useViewComponents, ViewObjectFromDefn} from "@itsmworkbench/viewobject";
import {asAuthentication} from "@itsmworkbench/authentication";
import {useAuthenticationPlugins} from "@itsmworkbench/react_authentication";
import {isErrors} from "@itsmworkbench/errors";


export type AuthenticationProps = {
    org: string
}

export const loadAuthentication = (urlStore: UrlStore): Kleisli<string, NameAnd<ErrorsAnd<Authentication>>> => {
    return async (org) => {
        const query: UrlQuery = {
            org,
            namespace: authenticationNameSpace,
            pageQuery: {page: 1},
            order: "name",
        }
        const names = await urlStore.list(query)
        if (hasErrors(names)) throw new Error(names.join("\n"))
        const result: NameAnd<ErrorsAnd<Authentication>> = {}
        await mapAsync(names.names, async (name) => {
            const url: NamedUrl = {scheme: 'itsm', organisation: org, namespace: authenticationNameSpace, name}
            const res = await urlStore.loadNamed<Authentication>(url)
            result[name] = mapErrors(res, t => t.result)
        })
        return result
    };
}

export function Authentication({org}: AuthenticationProps) {
    const urlStore = useUrlStore()
    const {} = useCommonComponents()
    const [secretData]= useSecretData()
    const authPlugins = useAuthenticationPlugins()
    const {DataLayout, EncryptedView, StringView} = useViewComponents()
    const loader = useCallback(loadAuthentication(urlStore), [urlStore]);
    const {data, loading, error} = useKleisli(loader, org)
    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>
    const rootId = 'authentication';
    if (!hasEnteredPassword(secretData))return <div>Need to set password</div>
    return <>{Object.entries(data).map(([name, auth]) => {
        const authPlugin = asAuthentication(authPlugins, auth)
        return isErrors(authPlugin)
            ? <div>{authPlugin.errors.join("\n")}</div>
            : <ViewObjectFromDefn rootId={rootId} main={auth} objectDefn={authPlugin.value.objectDefn}/>
    })}</>
}


export function AuthenticationSovereignPane() {
    let org = 'me';
    return <Authentication org={org}/>
}

export const AuthenticationSovereignPagePlugin = makeSovereignStatePlugin(AuthenticationSovereignPane)


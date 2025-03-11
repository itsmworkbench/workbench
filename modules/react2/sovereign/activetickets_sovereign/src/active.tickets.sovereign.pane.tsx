import {makeSovereignStatePlugin} from "@itsmworkbench/sovereign";
import React, {useCallback} from "react";
import {useUrlStore} from "@itsmworkbench/reacturlstore";
import {useSecretData} from "@itsmworkbench/secrets";
import {mapAsync, NameAnd} from "@itsmworkbench/utils";
import {UrlQuery, UrlStore} from "@itsmworkbench/urlstore";
import {Kleisli, useKleisli} from "@itsmworkbench/loading";
import {ErrorsAnd, hasErrors} from "@laoban/utils";
import {Authentication} from "@itsmworkbench/login";
import {authenticationNameSpace, AuthFn, AuthFnResult, hasEnteredPassword} from "@itsmworkbench/authentication";
import {ViewObjectFromDefn} from "@itsmworkbench/viewobject";
import {useAuthFn} from "@itsmworkbench/react_authentication";
import {ErrorsOr, isErrors} from "@itsmworkbench/errors";
import {BooleanFeatureFlag} from "@itsmworkbench/react_utils";

export const activeTicketsFF = "activeTickets"
export const activeTicketsFeatureFlag: BooleanFeatureFlag = {
    description: "Show Active Tickets instead of using old system",
    value: true
}
export type ActiveTicketsProps = {
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
        const res: NameAnd<ErrorsOr<AuthFnResult<any>>> = Object.fromEntries(await mapAsync(names.names,
            async name => ([name, await authFn(name)])));
        return res
    };
}

export function ActiveTicketsSovereignPane() {
    return <div>Active Tickets</div>
}


export const ActiveTicketsSovereignPagePlugin = makeSovereignStatePlugin(ActiveTicketsSovereignPane)


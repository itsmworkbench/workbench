import React from 'react'
import {ChatCompletionProvider} from "@itsmworkbench/ai2_react";
import {useSecretData} from "@itsmworkbench/secrets";
import {ChatCompletionFn, ChatCompletionMessage} from "@itsmworkbench/ai2";
import {useServiceCaller} from "@itsmworkbench/react_service_caller";
import {ServiceRequest, ServiceResponse} from "@itsmworkbench/service_caller";
import {useCallback} from "react";
import {useAuthFn} from "@itsmworkbench/react_authentication";
import {ErrorsOr, flatMapErrorsOrK} from "@itsmworkbench/errors";
import {decryptString, hasEnteredPassword} from "@itsmworkbench/authentication";
import {NameAnd} from "@itsmworkbench/utils";
import {ChatCompletionResponse} from "@itsmworkbench/azureai2/src/azureai";

export type AzureChatCompletionProviderProps = {
    children: React.ReactNode
    authName?: string
    url?: string
}

export const rawHeaders: NameAnd<string> = {
    'Content-Type': 'application/json',
}

export function AzureChatCompletionProvider({children, authName = 'azureai', url = 'someurl'}: AzureChatCompletionProviderProps) {
    const serviceCaller = useServiceCaller()
    const authFn = useAuthFn()
    const [secretData] = useSecretData()

    const completion: ChatCompletionFn = useCallback(async (request) => {
        if (!hasEnteredPassword(secretData)) return {errors: ['No password entered']}
        const decrypt = decryptString(secretData.cryptoKeyString)
        const result: Promise<ErrorsOr<ChatCompletionMessage>> = flatMapErrorsOrK(await authFn(authName), async ({auth, authPlugin}) => {
            const body = {}
            const sr: ServiceRequest<ChatCompletionResponse> = {
                method: 'POST',
                url: await authPlugin.modifyUrl(decrypt, url, auth),
                body: JSON.stringify(body),
                headers: await authPlugin.addToHeaders(decrypt, auth, rawHeaders),
            }
            return flatMapErrorsOrK<ServiceResponse<ChatCompletionResponse>, ChatCompletionMessage>(await serviceCaller(sr),
                async res => {
                    const choices = res.body.choices
                    if (!choices || choices.length === 0) return {errors: ['No choices in response']}
                    return {value: choices[0].message}
                })
        })
        return result
    }, [authFn, serviceCaller, secretData]);
    return <ChatCompletionProvider chatCompletion={completion}>{children}</ChatCompletionProvider>
}
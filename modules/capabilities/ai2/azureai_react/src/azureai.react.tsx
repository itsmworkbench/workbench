import React, {useRef} from 'react'
import {ChatCompletionProvider, useRememberChatCompletionFn} from "@itsmworkbench/ai2_react";
import {useSecretData} from "@itsmworkbench/secrets";
import {aiDebugName, ChatCompletionFn, ChatCompletionMessage} from "@itsmworkbench/ai2";
import {useServiceCaller} from "@itsmworkbench/react_service_caller";
import {ServiceRequest, ServiceResponse} from "@itsmworkbench/service_caller";
import {useCallback} from "react";
import {useAuthFn} from "@itsmworkbench/react_authentication";
import {ErrorsOr, flatMapErrorsOrK} from "@itsmworkbench/errors";
import {decryptString, hasEnteredPassword} from "@itsmworkbench/authentication";
import {NameAnd} from "@itsmworkbench/utils";
import {ChatCompletionResponse} from "@itsmworkbench/azureai2/src/azureai";
import {useDebug} from "@itsmworkbench/react_utils";
import {cacheErrorsOrKleisli, CacheItem} from "@itsmworkbench/errors/src/error.or.cache";

export type AzureChatCompletionProviderProps = {
    children: React.ReactNode
    authName?: string
    url?: string
}

export const rawHeaders: NameAnd<string> = {
    'Content-Type': 'application/json',
}

export function AzureChatCompletionProviderWithCache({
                                                children,
                                                authName = 'azureai',
                                                url = 'https://api.openai.com/v1/chat/completions'
                                            }: AzureChatCompletionProviderProps) {
    const serviceCaller = useServiceCaller();
    const remember = useRememberChatCompletionFn();
    const authFn = useAuthFn();
    const [secretData] = useSecretData();
    const debug = useDebug(aiDebugName);

    // Stable cache instance:
    const cacheRef = useRef(new Map<string, CacheItem<ChatCompletionMessage>>());

    const fetchCompletion: ChatCompletionFn = useCallback(async (request) => {
        if (!hasEnteredPassword(secretData)) return { errors: ['No password entered'] };

        const decrypt = decryptString(secretData.cryptoKeyString);
        const body = {
            model: "gpt-4o-mini",
            messages: request
        };

        debug('AzureChatCompletionProvider', request, body);

        const result: ErrorsOr<ChatCompletionMessage> = await flatMapErrorsOrK(
            await authFn(authName),
            async ({ auth, authPlugin }) => {
                const sr: ServiceRequest<ChatCompletionResponse> = {
                    method: 'POST',
                    url: await authPlugin.modifyUrl(decrypt, url, auth),
                    body: JSON.stringify(body),
                    headers: await authPlugin.addToHeaders(decrypt, auth, rawHeaders),
                };

                debug('AzureChatCompletionProvider', sr);

                return flatMapErrorsOrK<ServiceResponse<ChatCompletionResponse>, ChatCompletionMessage>(
                    await serviceCaller(sr, debug),
                    async res => {
                        debug('AzureChatCompletionProvider', 'res', res);
                        const choices = res.body.choices;
                        const result = !choices || choices.length === 0
                            ? { errors: ['No choices in response'] }
                            : { value: choices[0].message };
                        debug('AzureChatCompletionProvider', 'result', result);
                        return result;
                    }
                );
            }
        );

        remember(request, result);
        return result;
    }, [authFn, serviceCaller, secretData]);

    const cachedCompletion = cacheErrorsOrKleisli<ChatCompletionMessage[], ChatCompletionMessage>(
        fetchCompletion,
        {
            reqToString: req => JSON.stringify(req),
            ttl: 600000 , // 10mins
            cache: cacheRef.current,
        }
    ) as ChatCompletionFn;

    return <ChatCompletionProvider chatCompletion={cachedCompletion}>{children}</ChatCompletionProvider>;
}


export function AzureChatCompletionProvider({children, authName = 'azureai', url = 'https://api.openai.com/v1/chat/completions'}: AzureChatCompletionProviderProps) {
    const serviceCaller = useServiceCaller()
    const remember = useRememberChatCompletionFn()
    const authFn = useAuthFn()
    const [secretData] = useSecretData()
    const debug = useDebug(aiDebugName)

    const completion: ChatCompletionFn = useCallback(async (request) => {
        if (!hasEnteredPassword(secretData)) return {errors: ['No password entered']}
        const decrypt = decryptString(secretData.cryptoKeyString)
        const body = {
            model: "gpt-4o-mini",
            messages: request
        }
        debug('AzureChatCompletionProvider', request, body)
        const result: ErrorsOr<ChatCompletionMessage> = await flatMapErrorsOrK(await authFn(authName), async ({auth, authPlugin}) => {
            const sr: ServiceRequest<ChatCompletionResponse> = {
                method: 'POST',
                url: await authPlugin.modifyUrl(decrypt, url, auth),
                body: JSON.stringify(body),
                headers: await authPlugin.addToHeaders(decrypt, auth, rawHeaders),
            }
            debug('AzureChatCompletionProvider', sr)
            return flatMapErrorsOrK<ServiceResponse<ChatCompletionResponse>, ChatCompletionMessage>(await serviceCaller(sr, debug),
                async res => {
                    debug('AzureChatCompletionProvider', 'res', res)
                    const choices = res.body.choices
                    const result = !choices || choices.length === 0 ? {errors: ['No choices in response']} : {value: choices[0].message};
                    debug('AzureChatCompletionProvider', 'result', result)
                    return result
                })
        })
        remember(request, result)
        return result
    }, [authFn, serviceCaller, secretData]);
    return <ChatCompletionProvider chatCompletion={completion}>{children}</ChatCompletionProvider>
}
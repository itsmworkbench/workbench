import {GetterSetter, useDebug} from "@itsmworkbench/react_utils";
import {KADetails} from "@itsmworkbench/knowledgearticle";
import {useChatCompletion} from "@itsmworkbench/ai2_react";
import React, {useMemo, useState} from "react";
import {ErrorsOr, isErrors, isValue, mapErrorsOr} from "@itsmworkbench/errors";
import {useSecretData} from "@itsmworkbench/secrets";
import {hasEnteredPassword, SecretDataWithoutPasswordChecked} from "@itsmworkbench/authentication";
import {useRenderers} from "@itsmworkbench/renderers";
import {useItsmStateTicket} from "@itsmworkbench/itsm_state";
import {aiDebugName, ChatCompletionFn} from "@itsmworkbench/ai2";
import {Ticket} from "@itsmworkbench/tickets";
import {LoadingErrorsOr, useKleisli} from "@itsmworkbench/loading";
import {SimpleYamlEditor, YamlEditor} from "@itsmworkbench/react_editors";
import {DebugLogFn} from "@itsmworkbench/utils";

export type EntitiesForKaProps = {
    rootId?: string
    kaOps: GetterSetter<KADetails | undefined>
}

const noKaPrompt: string = `You will be provided with a ITSM work ticket, and your task is to extract important variables from it. 
Return these variables only in yaml format. Just the yaml, no markdown. If a value is a number please don't put any quotes around it.`

const kaPrompt = `You are provided with a text of an ITSM work ticket. 
Below is a list of specific attributes. For each attribute, compare it against the ticket text. 
If the attribute is present, return its value. 

It is really important that if the value is a number (even a floating point number) please don't put any quotes around it
If it is not found, indicate TypeScript type "undefined". 

Remember this is yaml. Remember not to wrap the yaml in markdown. That's very important

\n\nAttributes:\n{attributesList}`

export function prompt(ka: KADetails | undefined) {
    return ka?.ka?.variables ? kaPrompt.replace('{attributesList}', ka.ka?.variables?.join('\n')) : noKaPrompt
}

export type LoadEntitiesProps = {
    debug: DebugLogFn
    chatFn: ChatCompletionFn
    ka: KADetails
    ticket: Ticket
    sad: SecretDataWithoutPasswordChecked
}

async function loadEntities({chatFn, ka, ticket, sad, debug}: LoadEntitiesProps): Promise<ErrorsOr<string>> {
    if (!hasEnteredPassword(sad)) return {errors: ['No password entered']}
    const content = prompt(ka);
    debug('prompt', content, ticket)
    return mapErrorsOr(await chatFn([
            {role: 'system', content: content},
            {role: 'user', content: JSON.stringify(ticket, null, 2)}]),
        c => {
            debug('loadEntities', c);
            return c.content;
        })
}

export function EntitiesForKa({kaOps, rootId = 'entities.for.ka'}: EntitiesForKaProps) {
    const [ka] = kaOps
    const debug = useDebug(aiDebugName)
    const [ticket] = useItsmStateTicket()
    const chatFn = useChatCompletion()
    const [sad] = useSecretData()
    const {H2} = useRenderers()
    const query: LoadEntitiesProps = useMemo(() => ({chatFn, ka, ticket, sad, debug}), [chatFn, ka, ticket, sad, debug.debug])
    const chatState = useKleisli(loadEntities, query)
    const [errors, setErrors] = useState<string[]>([])
    const [entities, setEntities] = useState<string>('')
    return <>
        <H2 rootId={rootId} attribute={'entities'} value={'Entities'}/>
        <LoadingErrorsOr input={query} kleisli={loadEntities}>{suggestion =>
            <>
                <pre>{JSON.stringify(suggestion)}</pre>
                <SimpleYamlEditor initial={suggestion} onError={setErrors} onChange={setEntities}/>
            </>
        }</LoadingErrorsOr>
        <pre>{JSON.stringify(errors)}</pre>
        <pre>{JSON.stringify(entities)}</pre>
    </>
}
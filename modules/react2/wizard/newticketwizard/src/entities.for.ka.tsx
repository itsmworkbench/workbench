import {GetterSetter} from "@itsmworkbench/react_utils";
import {KADetails} from "@itsmworkbench/knowledgearticle";
import {useChatCompletion} from "@itsmworkbench/ai2_react";
import React, {useMemo} from "react";
import {ErrorsOr, isErrors, isValue, mapErrorsOr} from "@itsmworkbench/errors";
import {useSecretData} from "@itsmworkbench/secrets";
import {hasEnteredPassword, SecretDataWithoutPasswordChecked} from "@itsmworkbench/authentication";
import {useRenderers} from "@itsmworkbench/renderers";
import {useItsmStateTicket} from "@itsmworkbench/itsm_state";
import {ChatCompletionFn} from "@itsmworkbench/ai2";
import {Ticket} from "@itsmworkbench/tickets";
import {useKleisli} from "@itsmworkbench/loading";

export type EntitiesForKaProps = {
    rootId?: string
    kaOps: GetterSetter<KADetails | undefined>
}

const noKaPrompt: string = `You will be provided with a ITSM work ticket, and your task is to extract important variables from it. 
Return these variables only in yaml format. Just the yaml, no markdown. If a value is a number please don't put any quotes around it.`

const kaPrompt = `You are provided with a text of an ITSM work ticket. 
Below is a list of specific attributes. For each attribute, compare it against the ticket text. 
If the attribute is present, return its value. 
The result is yaml. Just the yaml, no markdown
It is really important that if the value is a number (even a floating point number) please don't put any quotes around it
If it is not found, indicate TypeScript type "undefined". 
\n\nAttributes:\n{attributesList}`

export function prompt(ka: KADetails | undefined) {
    return ka?.ka?.variables ? kaPrompt.replace('{attributesList}', ka.ka?.variables?.join('\n')) : noKaPrompt
}

export type LoadEntitiesProps = {
    chatFn: ChatCompletionFn
    ka: KADetails
    ticket: Ticket
    sad: SecretDataWithoutPasswordChecked
}

async function loadEntities({chatFn, ka, ticket, sad}: LoadEntitiesProps): Promise<ErrorsOr<string>> {
    if (!hasEnteredPassword(sad)) return {errors: ['No password entered']}
    return mapErrorsOr(await chatFn([
        {role: 'system', content: prompt(ka)},
        {role: 'user', content: JSON.stringify(ticket, null, 2)}]), c => c.content)
}

export function EntitiesForKa({kaOps, rootId = 'entities.for.ka'}: EntitiesForKaProps) {
    const [ka] = kaOps
    const [ticket] = useItsmStateTicket()
    const chatFn = useChatCompletion()
    const [sad] = useSecretData()
    const {H2} = useRenderers()
    const query = useMemo(() => ({chatFn, ka, ticket, sad}), [chatFn, ka, ticket, sad])
    const chatState = useKleisli(loadEntities, query)
    return <>
        <H2 rootId={rootId} attribute={'entities'} value={'Entities'}/>
        {chatState.loading && <div>Loading</div>}
        {chatState.error && <div>{chatState.error}</div>}
        {isErrors(chatState.data) && <div>{JSON.stringify(chatState.data.errors, null, 2)}</div>}
        {isValue(chatState.data) && <pre data-testid={rootId}>{chatState.data.value}</pre>}
    </>
}
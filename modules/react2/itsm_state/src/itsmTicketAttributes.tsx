import {FieldDefn, ObjectDefn} from "@itsmworkbench/object_defn";
import {useItsmStateTicketAttributes} from "./itsm.state";
import React, {useMemo} from "react";
import {GetterSetter, useDebug} from "@itsmworkbench/react_utils";
import {EditObjectFromDefn} from "@itsmworkbench/editobject";
import {DebugLogFn, NameAnd} from "@itsmworkbench/utils";
import {lensBuilder} from "@itsmworkbench/optics";
import {aiDebugName, ChatCompletionFn} from "@itsmworkbench/ai2";
import {Ticket} from "@itsmworkbench/tickets";
import {hasEnteredPassword, SecretDataWithoutPasswordChecked} from "@itsmworkbench/authentication";
import {ErrorsOr, mapErrorsOr} from "@itsmworkbench/errors";
import {useChatCompletion} from "@itsmworkbench/ai2_react";
import {useSecretData} from "@itsmworkbench/secrets";
import {LoadingErrorsOr} from "@itsmworkbench/loading";
import {useYaml} from "@itsmworkbench/components";


const noKaPrompt: string = `You will be provided with a ITSM work ticket, and your task is to extract important variables from it. 
Return these variables only in json format. Just the json, no markdown. If a value is a number please don't put any quotes around it.`

const kaPrompt = `You are provided with a text of an ITSM work ticket. 
Below is a list of specific attributes. For each attribute, compare it against the ticket text. 
If the attribute is present, return its value. 

It is really important that if the value is a number (even a floating point number) please don't put any quotes around it
If it is not found, indicate TypeScript type "undefined". 

Remember this is json. Remember not to wrap the json in markdown. That's very important

\n\nAttributes:\n{attributesList}`

export function prompt(variables: string[]) {
    return kaPrompt.replace('{attributesList}', variables?.join('\n'))
}

export type LoadEntitiesProps = {
    debug: DebugLogFn
    chatCompletion: ChatCompletionFn
    attributeNames: string[]
    ticket: Ticket
    sad: SecretDataWithoutPasswordChecked
}

export async function loadEntities({chatCompletion, attributeNames, ticket, sad, debug}: LoadEntitiesProps): Promise<ErrorsOr<string>> {
    debug('loadEntities', ticket)
    if (!hasEnteredPassword(sad)) return {errors: ['No password entered']}
    if (attributeNames === undefined) return {errors: ['waiting for Knowledge Article to be selected']}
    const content = prompt(attributeNames);
    debug('loadEntities', 'prompt', content)
    const res = await chatCompletion([
        {role: 'system', content: content},
        {role: 'user', content: JSON.stringify(ticket, null, 2)}]);
    debug('loadEntities', 'chatCompletion', ticket)
    return mapErrorsOr(res, c => c.content)
}

export type ItsmTicketVariablesProps = {
    rootId: string
    ticket: Ticket
    attributeOps?: GetterSetter<Record<string, string>>
    attributeNames: string[]
}

function makeObjectDefn(attributeNames: string[]) {
    const fields: NameAnd<FieldDefn<Record<string, string>, string>> = {}
    const lb = lensBuilder<Record<string, string>>()
    for (const name of attributeNames)
        fields[name] = {fieldType: 'string', lens: lb.focusOn(name)}
    const objectDefn: ObjectDefn<Record<string, string>> = {fields, layout: []}
    return objectDefn
}


export function LoadAndEditItsmTicketAttributes({rootId, attributeOps, ticket, attributeNames}: ItsmTicketVariablesProps) {
    const defaultOps = useItsmStateTicketAttributes()
    const ops = attributeOps || defaultOps
    const chatCompletion = useChatCompletion()
    const [sad] = useSecretData()
    const debug = useDebug(aiDebugName)
    const query: LoadEntitiesProps = useMemo(() => {
            debug('LoadAndEditItsmTicketAttributes', 'LoadEntitiesProps', {chatCompletion, attributeNames, ticket, sad, debug: debug.debug});
            return ({chatCompletion, attributeNames, ticket, sad, debug});
        },
        // [])
        [chatCompletion, attributeNames, sad, debug.debug]) //adding ticket would cause infinite loop, and isn't needed
    const objectDefn = useMemo(() => makeObjectDefn(attributeNames), [attributeNames])
    const yaml = useYaml()

    function onLoad(content: string) {
        const json = yaml.parser(content)
        ops[1](json)
    }

    return <LoadingErrorsOr input={query} kleisli={loadEntities} onLoad={onLoad}>{_ =>
        <EditObjectFromDefn clipboard={true} showLabel='camelLastPathPart' title={'ticket.variables'} objectDefn={objectDefn} rootId={rootId} mainOps={ops}/>
    }</LoadingErrorsOr>
}
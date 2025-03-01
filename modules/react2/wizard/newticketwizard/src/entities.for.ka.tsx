import {GetterSetter} from "@itsmworkbench/react_utils";
import {KADetails} from "@itsmworkbench/knowledgearticle";
import {useChatCompletion} from "@itsmworkbench/ai2_react";
import {useEffect, useState} from "react";
import {isErrors} from "@itsmworkbench/errors";
import {useSecretData} from "@itsmworkbench/secrets";
import {hasEnteredPassword} from "@itsmworkbench/authentication";
import React from "react";
import {useRenderers} from "@itsmworkbench/renderers";
import {useItsmStateTicket} from "@itsmworkbench/itsm_state";

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


export function EntitiesForKa({kaOps, rootId = 'entities.for.ka'}: EntitiesForKaProps) {
    const [ka] = kaOps
    const [ticket] = useItsmStateTicket()
    const chatFn = useChatCompletion()
    const [yaml, setYaml] = useState('{}')
    const [errors, setErrors] = useState<string[]>([])
    const [sad] = useSecretData()
    const {H2} = useRenderers()
    useEffect(() => {
            setErrors([])
        setYaml('{}')
            if (!hasEnteredPassword(sad)) return setErrors(['No password entered'])
            chatFn([{role: 'system', content: prompt(ka)}, {role: 'user', content: JSON.stringify(ticket, null, 2)}]).then(async (msg) => {
                if (isErrors(msg)) return setErrors(msg.errors)
                setYaml(msg.value.content)
                setErrors([])
            }).catch(e => setErrors([e.message]))
        },
        [ka, sad]);
    return <>
        <H2 rootId={rootId} attribute={'entities'} value={'Entities'}/>
        {errors.length > 0 && <pre>{JSON.stringify(errors)}</pre>}
        <pre data-testid={rootId}>{yaml}</pre>
    </>
}
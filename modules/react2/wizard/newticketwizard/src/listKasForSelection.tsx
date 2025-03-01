import {aiDebugName, showAiPromptsFFName} from "@itsmworkbench/ai2";
import {ErrorsOr, isErrors, isValue, mapErrorsOr} from "@itsmworkbench/errors";
import React, {useEffect, useState} from "react";
import {useAttributeValueComponents} from "@itsmworkbench/renderers";
import {useUrlStore} from "@itsmworkbench/reacturlstore";
import {useChatCompletion} from "@itsmworkbench/ai2_react";
import {GetterSetter, useDebug, useFeatureFlag} from "@itsmworkbench/react_utils";
import {} from "./new.ticket.wizard";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useTranslation} from "@itsmworkbench/translation";
import {UrlStore} from "@itsmworkbench/urlstore";
import {simpleTemplate} from "@itsmworkbench/utils";
import {findKaDetails, KADetails} from "@itsmworkbench/knowledgearticle";
import {ItsmState, useItsmState} from "@itsmworkbench/itsm_state";


export type AiSuggestedKaProps = {
    organisation: string
    system: string
    onSelect: (ka: KADetails) => void
}

function makePromptFor(kad: KADetails) {
    return `* ${kad.name}: ${kad.descriptionOrError}`
}

export async function makePrompt(urlStore: UrlStore, ntd: ItsmState) {
    const kadse = await findKaDetails(urlStore, 'me', ntd.system)
    const kaPrompt = mapErrorsOr(kadse, kads =>
        kads.filter(kad => kad.ka).map(kad => makePromptFor(kad)).join('\n')
    )
    const rawPrompt = `
You are a categoriser. Your job is to work out which knowledge article the attached ticket is best described by

The knowledge articles are
{kas}
The ticket is
{ticket}

In your answer just give the name of the knowledge article and nothing else. It is really important to us that if the 
ticket is not matched by a knowledge article you respond 'unknown', so think carefully about your answer
`
    return mapErrorsOr(kaPrompt, kas => simpleTemplate(rawPrompt, {ticket: ntd.ticket.description, kas}))
}


export function ListKasForSelection({organisation, system, ...rest}: AiSuggestedKaProps) {
    const urlStore = useUrlStore();
    const [newTicketData] = useItsmState()
    const debug = useDebug(aiDebugName)
    const [kaDetails, setKaDetails] = useState<ErrorsOr<KADetails[]>>({errors: ['Loading']})
    useEffect(() => {
        debug('Finding ka details', urlStore, organisation, system)
        findKaDetails(urlStore, organisation, system).then(setKaDetails)
    }, [urlStore, organisation, system]);
    const [aiSuggestedKa, setAiSuggestedKa] = useState<ErrorsOr<string>>({errors: ['Loading']})

    const [prompt, setPrompt] = useState<ErrorsOr<string>>({errors: ['Loading']})
    const chatCompletion = useChatCompletion()
    const ff = useFeatureFlag(showAiPromptsFFName)
    const {DataLayout, Json} = useAttributeValueComponents()
    const selectedRowOps = useState(-1)
    useEffect(() => {
        makePrompt(urlStore, newTicketData).then(p => {
            if (JSON.stringify(p) !== JSON.stringify(prompt))
                setPrompt(p)
        })
    }, [newTicketData]);

    useEffect(() => {
        if (isValue(prompt)) {
            setAiSuggestedKa({errors: ['Loading']})
            chatCompletion([{role: 'assistant', content: prompt.value}]).then(res => {
                debug('ListKasForSelection-chatCompletion', res)
                setAiSuggestedKa(mapErrorsOr(res, r => {
                    selectedRowOps[1](0)
                    if (isValue(kaDetails)) {
                        rest.onSelect(kaDetails.value[0])
                    }
                    return r.content;
                }));

            })
        } else
            setAiSuggestedKa(prompt)
    }, [chatCompletion, prompt]);

    const rootId = 'ai-suggested-ka'


    return <div data-testid={rootId}>
        <KaLoadTable kaDetails={kaDetails} aiSuggestedKa={aiSuggestedKa} selectedRowOps={selectedRowOps} {...rest}/>
        {ff && <DataLayout rootId={rootId} layout={[1, 1, 1]}>
            <Json rootId={rootId} attribute='newTicket.prompt' value={isErrors(prompt) ? prompt.errors.join('\n') : prompt.value}/>
        </DataLayout>}

    </div>
}

export type KaLoadTableProps = {
    kaDetails: ErrorsOr<KADetails[]>
    aiSuggestedKa: ErrorsOr<string>
    onSelect: (ka: KADetails) => void
    selectedRowOps: GetterSetter<number>
}

function getTextForAiSuggestion(aiSuggestedKa: ErrorsOr<string>, index: number, name: string, kaDetails: KADetails[]) {
    if (isErrors(aiSuggestedKa)) return aiSuggestedKa.errors.join(',')
    if (kaDetails.length === 0) return `No KAs found for AI to make suggestion`
    if (name === 'unknown') return 'unknown'
    if (index === -1) return `Odd choice: ${name}`
    return kaDetails[index].name;
}

export function KaLoadTable({kaDetails, aiSuggestedKa, onSelect, selectedRowOps}: KaLoadTableProps) {
    const {Table} = useCommonComponents()
    const {DataLayout, Json} = useAttributeValueComponents()
    if (isErrors(kaDetails)) return <div>{kaDetails.errors.join('\n')}</div>
    const name = isErrors(aiSuggestedKa) ? undefined : aiSuggestedKa.value
    const data = [...kaDetails.value]
    const index = data.findIndex(ka => ka.name === name)
    useEffect(() => {
        selectedRowOps[1](index)
        if (index !== -1) onSelect(data[index])
    }, [index]);
    const text = getTextForAiSuggestion(aiSuggestedKa, index, name, kaDetails.value)
    const rootId = 'list-kas-for-selection'
    return <DataLayout rootId={rootId} layout={[1, 1, 1]}>
        <span>Ai suggests: {text}</span>
        <Table titles={['Name', 'Description']} keys={['name', 'descriptionOrError']} data={data} onRowSelect={onSelect} selectedRowOps={selectedRowOps}/>
    </DataLayout>

}


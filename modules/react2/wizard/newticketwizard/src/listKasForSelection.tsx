import {aiDebugName, showAiPromptsFFName} from "@itsmworkbench/ai2";
import {ErrorsOr, isErrors, isValue, mapErrorsOr} from "@itsmworkbench/errors";
import React, {useEffect, useState} from "react";
import {useAttributeValueComponents, useRenderers} from "@itsmworkbench/renderers";
import {findKaDetails, KADetails, useUrlStore} from "@itsmworkbench/reacturlstore";
import {useChatCompletion} from "@itsmworkbench/ai2_react";
import {useDebug, useFeatureFlag} from "@itsmworkbench/react_utils";
import {makePrompt} from "./select.knowledge.article.ticket.wizard.page";
import {useNewTicketWizardData} from "./new.ticket.wizard";
import {useCommonComponents} from "@itsmworkbench/common_components";

export type AiSuggestedKaProps = {
    organisation: string
    system: string
    onSelect: (ka: KADetails) => void
    onNewKa: () => void
}


export function ListKasForSelection({organisation, system, ...rest}: AiSuggestedKaProps) {
    const {Text} = useRenderers();
    const {DataLayout} = useAttributeValueComponents();
    const {Table} = useCommonComponents()
    const urlStore = useUrlStore();
    const [newTicketData] = useNewTicketWizardData()

    const [kaDetails, setKaDetails] = useState<ErrorsOr<KADetails[]>>({errors: ['Loading']})
    useEffect(() => {
        findKaDetails(urlStore, organisation, system).then(setKaDetails)
    }, [urlStore, organisation, system]);
    const [aiSuggestedKa, setAiSuggestedKa] = useState<ErrorsOr<string>>({errors: ['Loading']})

    const [prompt, setPrompt] = useState<ErrorsOr<string>>({errors: ['Loading']})
    const chatCompletion = useChatCompletion()
    const debug = useDebug(aiDebugName)
    const ff = useFeatureFlag(showAiPromptsFFName)

    useEffect(() => {
        makePrompt(urlStore, newTicketData).then(p => setPrompt(p))
    }, [newTicketData]);

    useEffect(() => {
        if (isValue(prompt)) {
            setAiSuggestedKa({errors: ['Loading']})
            chatCompletion([{role: 'assistant', content: prompt.value}]).then(res => {
                debug('ListKasForSelection-chatCompletion', res)
                setAiSuggestedKa(mapErrorsOr(res, r => r.content));
            })
        } else
            setAiSuggestedKa(prompt)
    }, [chatCompletion, prompt]);

    const rootId = 'ai-suggested-ka'


    return <div data-testid={rootId}>
        <KaLoadTable kaDetails={kaDetails} aiSuggestedKa={aiSuggestedKa} {...rest}/>
    </div>
}

export type KaLoadTableProps = {
    kaDetails: ErrorsOr<KADetails[]>
    aiSuggestedKa: ErrorsOr<string>
    onSelect: (ka: KADetails) => void
    onNewKa: () => void
}

export function KaLoadTable({kaDetails, aiSuggestedKa, onNewKa, onSelect}: KaLoadTableProps) {
    const {Table} = useCommonComponents()
    const {DataLayout} = useAttributeValueComponents()
    if (isErrors(kaDetails)) return <div>{kaDetails.errors.join('\n')}</div>
    const name = isErrors(aiSuggestedKa) ? undefined : aiSuggestedKa.value
    if (isErrors(kaDetails)) return <div>{kaDetails.errors.join('\n')}</div>
    const data = [...kaDetails.value]
    const index = data.findIndex(ka => ka.name === name)
    const text = isErrors(aiSuggestedKa) ? aiSuggestedKa.errors.join(',') : index === -1 ? `Odd choice: ${name}` : kaDetails.value[index].name
    const dataWithKa = index >= 0 ? [data[index], ...data.slice(0, index).concat(data.slice(index + 1))] : data

    return <DataLayout rootId='list-kas-for-selection' layout={[1, 1, 1]}>
        <button onClick={onNewKa}>This is a new kind of ticket, none of these articles are relevant</button>
        <span>Ai suggests: {text}</span>
        <Table titles={['Name', 'Description']} keys={['name', 'descriptionOrError']} data={dataWithKa} onRowSelect={onSelect}/>
    </DataLayout>

}
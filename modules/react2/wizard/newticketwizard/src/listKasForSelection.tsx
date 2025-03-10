import {ChatCompletionFn} from "@itsmworkbench/ai2";
import {ErrorsOr, mapErrorsOr} from "@itsmworkbench/errors";
import React, {useMemo} from "react";
import {useAttributeValueComponents, useRenderers} from "@itsmworkbench/renderers";
import {useUrlStore} from "@itsmworkbench/reacturlstore";
import {GetterSetter} from "@itsmworkbench/react_utils";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {simpleTemplate} from "@itsmworkbench/utils";
import {findKaDetails, KADetails, KaDetailsProps} from "@itsmworkbench/knowledgearticle";
import {LoadingErrorsOr} from "@itsmworkbench/loading";
import {Ticket} from "@itsmworkbench/tickets";
import {useTranslation} from "@itsmworkbench/translation";


export type AiSuggestedKaProps = {
    organisation: string
    system: string
    onSelect: (ka: KADetails) => void
}

function makePromptFor(kad: KADetails) {
    return `* ${kad.name}: ${kad.descriptionOrError}`
}


const rawPrompt = `
You are a categoriser. Your job is to work out which knowledge article the attached ticket is best described by

The knowledge articles are
{kas}
The ticket is
{ticket}

In your answer just give the name of the knowledge article and nothing else. It is really important to us that if the 
ticket is not matched by a knowledge article you respond 'unknown', so think carefully about your answer
`

function makePrompt2(kads: KADetails[], ticket: Ticket) {
    const kas = kads.map(kad => `* ${kad.name}: ${kad.descriptionOrError}`).join('\n')
    return simpleTemplate(rawPrompt, {ticket: JSON.stringify(ticket, null, 2), kas})
}

export type LoadAiSuggestionProps = {
    kaDetails: KADetails[]
    ticket: Ticket
    chatCompletion: ChatCompletionFn
}

export async function loadAiSuggestion({kaDetails, ticket, chatCompletion}: LoadAiSuggestionProps): Promise<ErrorsOr<string>> {
    // if (kaDetails.length === 0) return {errors: ['Cannot use AI to select a KA as there are no KAs']}
    const prompt = makePrompt2(kaDetails, ticket)
    const res = await chatCompletion([{role: 'system', content: prompt}])
    return mapErrorsOr(res, r => r.content)
}


export type ListKa2Props = {
    organisation: string
    system: string
    selectedRowOps: GetterSetter<number>
    onSelect: (ka: KADetails) => void
    onLoad: (kas: KADetails[]) => void
    children?: React.ReactNode
}


export function ListKasForSelection2({organisation, system, onLoad, onSelect, selectedRowOps, children}: ListKa2Props) {
    const urlStore = useUrlStore();
    const kaDetailsQuery: KaDetailsProps = useMemo(() => ({org: organisation, system, urlStore}), [organisation, system, urlStore])
    const {Table} = useCommonComponents()
    const {H1} = useRenderers()
    const translate=useTranslation()
    const {DataLayout} = useAttributeValueComponents()
    return <LoadingErrorsOr input={kaDetailsQuery} kleisli={findKaDetails} onLoad={onLoad}>{
        kaDetails => <DataLayout rootId={'list-kas'} layout={[1, 1, 1]}>
            <H1 rootId={'listKas'} attribute='knowledgeArticle.title' value={translate('knowledgeArticles.title')}/>
            {children}
            <Table titles={['Name', 'Description']} keys={['name', 'descriptionOrError']} data={kaDetails} onRowSelect={onSelect} selectedRowOps={selectedRowOps}/>
        </DataLayout>
    }</LoadingErrorsOr>
}

//
// export function ListKasForSelection({organisation, system, ...rest}: AiSuggestedKaProps) {
//     const urlStore = useUrlStore();
//     const [newTicketData] = useItsmState()
//     const debug = useDebug(aiDebugName)
//     const [kaDetails, setKaDetails] = useState<ErrorsOr<KADetails[]>>({errors: ['Loading']})
//     useEffect(() => {
//         debug('Finding ka details', urlStore, organisation, system)
//         findKaDetails({urlStore, org: organisation, system}).then(setKaDetails)
//     }, [urlStore, organisation, system]);
//     const [aiSuggestedKa, setAiSuggestedKa] = useState<ErrorsOr<string>>({errors: ['Loading']})
//
//     const [prompt, setPrompt] = useState<ErrorsOr<string>>({errors: ['Loading']})
//     const chatCompletion = useChatCompletion()
//     const ff = useFeatureFlag(showAiPromptsFFName)
//     const {DataLayout, Json} = useAttributeValueComponents()
//     const selectedRowOps = useState(-1)
//     useEffect(() => {
//         makePrompt(urlStore, newTicketData).then(p => {
//             if (JSON.stringify(p) !== JSON.stringify(prompt))
//                 setPrompt(p)
//         })
//     }, [newTicketData]);
//
//     useEffect(() => {
//         if (isValue(prompt)) {
//             setAiSuggestedKa({errors: ['Loading']})
//             chatCompletion([{role: 'assistant', content: prompt.value}]).then(res => {
//                 debug('ListKasForSelection-chatCompletion', res)
//                 setAiSuggestedKa(mapErrorsOr(res, r => {
//                     selectedRowOps[1](0)
//                     if (isValue(kaDetails)) {
//                         rest.onSelect(kaDetails.value[0])
//                     }
//                     return r.content;
//                 }));
//
//             })
//         } else
//             setAiSuggestedKa(prompt)
//     }, [chatCompletion, prompt]);
//
//     const rootId = 'ai-suggested-ka'
//
//
//     return <div data-testid={rootId}>
//         <KaLoadTable kaDetails={kaDetails} aiSuggestedKa={aiSuggestedKa} selectedRowOps={selectedRowOps} {...rest}/>
//         {ff && <DataLayout rootId={rootId} layout={[1, 1, 1]}>
//             <Json rootId={rootId} attribute='newTicket.prompt' value={isErrors(prompt) ? prompt.errors.join('\n') : prompt.value}/>
//         </DataLayout>}
//
//     </div>
// }
//
// export type KaLoadTableProps = {
//     kaDetails: ErrorsOr<KADetails[]>
//     aiSuggestedKa: ErrorsOr<string>
//     onSelect: (ka: KADetails) => void
//     selectedRowOps: GetterSetter<number>
// }
//
// function getTextForAiSuggestion(aiSuggestedKa: ErrorsOr<string>, index: number, name: string, kaDetails: KADetails[]) {
//     if (isErrors(aiSuggestedKa)) return aiSuggestedKa.errors.join(',')
//     if (kaDetails.length === 0) return `No KAs found for AI to make suggestion`
//     if (name === 'unknown') return 'unknown'
//     if (index === -1) return `Odd choice: ${name}`
//     return kaDetails[index].name;
// }
//
//
// export function KaLoadTable({kaDetails, aiSuggestedKa, onSelect, selectedRowOps}: KaLoadTableProps) {
//     const {Table} = useCommonComponents()
//     const {DataLayout, Json} = useAttributeValueComponents()
//     if (isErrors(kaDetails)) return <div>{kaDetails.errors.join('\n')}</div>
//     const name = isErrors(aiSuggestedKa) ? undefined : aiSuggestedKa.value
//     const data = [...kaDetails.value]
//     const index = data.findIndex(ka => ka.name === name)
//     useEffect(() => {
//         selectedRowOps[1](index)
//         if (index !== -1) onSelect(data[index])
//     }, [index]);
//     const text = getTextForAiSuggestion(aiSuggestedKa, index, name, kaDetails.value)
//     const rootId = 'list-kas-for-selection'
//     return <DataLayout rootId={rootId} layout={[1, 1, 1]}>
//         <span>Ai suggests: {text}</span>
//         <Table titles={['Name', 'Description']} keys={['name', 'descriptionOrError']} data={data} onRowSelect={onSelect} selectedRowOps={selectedRowOps}/>
//     </DataLayout>
//
// }


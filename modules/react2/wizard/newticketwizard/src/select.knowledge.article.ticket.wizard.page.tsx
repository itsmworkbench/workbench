import {WizardPanel, WizardPanelProps} from "@itsmworkbench/wizard";
import React, {useEffect, useState} from "react";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useSystems} from "@itsmworkbench/system";
import {useAttributeValueComponents, useRenderers} from "@itsmworkbench/renderers";
import {useTranslation} from "@itsmworkbench/translation";
import {findKaDetails, KADetails, useUrlStore} from "@itsmworkbench/reacturlstore";
import {NewTicketWizardData, useNewTicketTicket, useNewTicketWizardData} from "./new.ticket.wizard";
import {UrlStore} from "@itsmworkbench/urlstore";
import {ErrorsOr, isErrors, isValue, mapErrorsOr} from "@itsmworkbench/errors";
import {simpleTemplate} from "@itsmworkbench/utils";
import {Ticket} from "@itsmworkbench/tickets";
import {useChatCompletion} from "@itsmworkbench/ai2_react";
import {aiDebugName, ChatCompletionMessage, showAiPromptsFFName} from "@itsmworkbench/ai2";
import {useDebug, useFeatureFlag} from "@itsmworkbench/react_utils";
import {ListKasForSelection} from "./listKasForSelection";


function makePromptFor(kad: KADetails) {
    return `* ${kad.name}: ${kad.descriptionOrError}`
}

export async function makePrompt(urlStore: UrlStore, ntd: NewTicketWizardData) {
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

export const SelectKnowledgeArticleTicketWizardPage: WizardPanel<Ticket> = ({
                                                                                name,
                                                                                description,
                                                                                steps,
                                                                                ops,
                                                                                stepOps
                                                                            }: WizardPanelProps<Ticket>) => {
    const urlStore = useUrlStore()
    const {H1} = useRenderers()
    const {DataLayout, Text, Json} = useAttributeValueComponents()
    const {ClipHeight, Table} = useCommonComponents()
    const [newTicketData] = useNewTicketWizardData()
    const [ticket] = useNewTicketTicket()
    const rootId = 'select-knowledge-article-ticket-wizard'
    const translation = useTranslation()
    const [prompt, setPrompt] = useState<ErrorsOr<string>>({value: ''})
    const chatCompletion = useChatCompletion()
    const [chatResult, setChatResult] = useState<ErrorsOr<ChatCompletionMessage>>()
    const debug = useDebug(aiDebugName)
    const ff = useFeatureFlag(showAiPromptsFFName)
    useEffect(() => {
        makePrompt(urlStore, newTicketData).then(p => setPrompt(p))
    }, [newTicketData]);

    useEffect(() => {
        if (isValue(prompt)) {
            chatCompletion([{role: 'assistant', content: prompt.value}]).then(res => {
                debug('SelectKnowledgeArticleTicketWizardPage-chatCompletion', res)
                setChatResult(res);
            })
        } else
            setChatResult(prompt)
    }, [chatCompletion, prompt]);
    return <>
        <div data-testid={rootId}>
            <pre>{JSON.stringify(newTicketData)}</pre>
            <DataLayout rootId={rootId} layout={[1, 2, 1, 1]}>
                <H1 rootId={rootId} attribute='newTicket.ticket' value={translation('newTicket.ticket')}/>
                <Text rootId={rootId} attribute='newTicket.id' value={ticket.id}/>
                <Text rootId={rootId} attribute='newTicket.summary' value={ticket.summary}/>
                <ClipHeight maxHeight='200px'>
                    <Text rootId={rootId} attribute='newTicket.description' value={ticket.description}/>
                </ClipHeight>
            </DataLayout>
            {ff && <DataLayout rootId={rootId} layout={[1, 1, 1]}>
                <Json rootId={rootId} attribute='newTicket.prompt' value={isErrors(prompt) ? prompt.errors.join('\n') : prompt.value}/>
            </DataLayout>}
            <ListKasForSelection system={newTicketData.system} organisation={'me'}/>
        </div>

    </>

}
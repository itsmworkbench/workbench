import {nextWizardStep, WizardPanel, WizardPanelProps} from "@itsmworkbench/wizard";
import React, {useEffect, useState} from "react";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useAttributeValueComponents, useRenderers} from "@itsmworkbench/renderers";
import {useTranslation} from "@itsmworkbench/translation";
import {findKaDetails, KADetails, useUrlStore} from "@itsmworkbench/reacturlstore";
import {NewTicketWizardData, useNewTicketTicket, useNewTicketWizardData} from "./new.ticket.wizard";
import {NamedUrl, UrlStore} from "@itsmworkbench/urlstore";
import {ErrorsOr, isErrors, isValue, mapErrorsOr} from "@itsmworkbench/errors";
import {simpleTemplate} from "@itsmworkbench/utils";
import {Ticket} from "@itsmworkbench/tickets";
import {useChatCompletion} from "@itsmworkbench/ai2_react";
import {aiDebugName, ChatCompletionMessage, showAiPromptsFFName} from "@itsmworkbench/ai2";
import {useDebug, useFeatureFlag} from "@itsmworkbench/react_utils";
import {hasErrors} from "@laoban/utils";
import {NewKnowledgeArticle} from "./newKnowledgeArticle";
import {defaultKnowledgeArticleDetails, KnowledgeArticleDetails} from "@itsmworkbench/knowledgearticle";


function makePromptFor(kad: KADetails) {
    return `* ${kad.name}: ${kad.descriptionOrError}`
}

async function makePrompt(urlStore: UrlStore, ntd: NewTicketWizardData) {
    const kadse = await findKaDetails(urlStore, 'me', ntd.system)
    const kaNames = mapErrorsOr(kadse, kads => kads.map(k => k.name))
    const rawPrompt = `
I want you to give me a short name for a new knowledge article, and a description. The knowledge article is the 'abstraction' of a 
ticket. Most tickets with the same knowledge article will be doing the same

For example here is a ticket:
* In the epx the discombobulator (item code 1234-44) has an incorrect price.
* The prices is currently 55.55.
* The price should be 44.44.

Please update this price in the EPX production.
----
The output for this would be
updatePrice
Updates the price of items in the EPX system
----
A second example:
Can you give me a name and description for this ticket:
* I created a project (P-66126)
* It is in Leo by mistake.
Action requested:
* Please delete this.

Thanks
----
The output from this would be
deleteProject
Deletes a project from Leo
----

I want your response to be two lines. The first line is the name of the knowledge article, the second line is the description.

Please do not duplicate any existing names. Existing names are these:
{kaNames}

The ticket is for the {system} system, and reads like this
{ticket}
`
    return mapErrorsOr(kaNames, kas => simpleTemplate(rawPrompt, {ticket: ntd.ticket.description, kaNames}))
}

export const CreateNewKnowledgeArticleWizardPage: WizardPanel<Ticket> = ({
                                                                             name,
                                                                             description,
                                                                             steps,
                                                                             ops,
                                                                             stepOps
                                                                         }: WizardPanelProps<Ticket>) => {
    const urlStore = useUrlStore()
    const [newTicketData] = useNewTicketWizardData()
    const [ticket, setTicket] = useNewTicketTicket()
    const rootId = 'select-knowledge-article-ticket-wizard'
    const [prompt, setPrompt] = useState<ErrorsOr<string>>({value: ''})
    const chatCompletion = useChatCompletion()
    const [chatResult, setChatResult] = useState<ErrorsOr<ChatCompletionMessage>>()
    const debug = useDebug(aiDebugName)
    const ff = useFeatureFlag(showAiPromptsFFName)
    const [errors, setErrors] = useState('')
    const kadOps = useState(defaultKnowledgeArticleDetails)
    useEffect(() => {
        debug('Making Prompt', newTicketData)
        makePrompt(urlStore, newTicketData).then(p => {
            if (JSON.stringify(prompt) !== JSON.stringify(p)) setPrompt(p)
        })
    }, [newTicketData]);

    useEffect(() => {
        debug('In Chat Completion', prompt, chatCompletion)
        if (isValue(prompt)) {
            chatCompletion([{role: 'assistant', content: prompt.value}]).then(res => {
                debug('CreateNewKnowledgeArticleWizardPage-chatCompletion', res)
                if (isErrors(res)) setErrors(res.errors.join(';'))
                else {
                    setErrors('')
                    const lines = res.value.content.split('\n').map(x => x.trim()).filter(x => x.length > 0)
                    debug('Lines in chat response', lines, lines.length)
                    if (lines.length === 2) {
                        kadOps[1](old => {
                            const name = old.name || lines[0]
                            const description = old.description || lines[1]
                            const result: KnowledgeArticleDetails = {...old, name, description};
                            debug('setKnowledgeArticleDetails', result)
                            return result;
                        })
                    }
                }
            }).catch(e => setErrors(e.message));
        } else
            setChatResult(prompt)
    }, [chatCompletion, prompt]);

    function newKa(kad: KADetails) {
        const url: NamedUrl = {scheme: 'itsm', namespace: 'ka', name: `${newTicketData.system}/${kad.name}`, organisation: 'me'}
        urlStore.save(url, kad.ka).then(res => {
            if (hasErrors(res)) throw new Error(res.join('\n'))
            const ticket: Ticket = {...newTicketData.ticket, kaName: kad.name}
            ops[1](ticket)
            nextWizardStep(steps, stepOps)
        })
    }

    return <>
        <div data-testid={rootId}>
            <NewKnowledgeArticle onNewKa={newKa} kadOps={kadOps}/>
            {ff && <pre>{JSON.stringify(prompt)}</pre>}
            {errors && <pre>{errors}</pre>}
        </div>
    </>

}
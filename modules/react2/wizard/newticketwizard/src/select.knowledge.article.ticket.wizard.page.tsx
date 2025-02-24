import {nextWizardStep, WizardPanel, WizardPanelProps} from "@itsmworkbench/wizard";
import React, {useEffect, useState} from "react";
import {useCommonComponents} from "@itsmworkbench/common_components";
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


export const SelectKnowledgeArticleTicketWizardPage: WizardPanel<Ticket> = ({
                                                                                name,
                                                                                description,
                                                                                steps,
                                                                                ops,
                                                                                stepOps
                                                                            }: WizardPanelProps<Ticket>) => {
    const {H1} = useRenderers()
    const {DataLayout, Text, Json} = useAttributeValueComponents()
    const {ClipHeight, Table} = useCommonComponents()
    const [newTicketData] = useNewTicketWizardData()
    const [ticket] = useNewTicketTicket()
    const rootId = 'select-knowledge-article-ticket-wizard'
    const translation = useTranslation()
    const translate = useTranslation()

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

            <button onClick={() => nextWizardStep(steps, stepOps)}>{translate('newTicket.newKa')}</button>
            <ListKasForSelection system={newTicketData.system} organisation={'me'}/>
        </div>

    </>

}
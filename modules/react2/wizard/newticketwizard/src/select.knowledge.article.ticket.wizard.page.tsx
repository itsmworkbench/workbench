import {nextWizardStep, WizardPanel, WizardPanelProps} from "@itsmworkbench/wizard";
import {Ticket} from "@itsmworkbench/tickets";
import React, {useState} from "react";
import {useTicketSources} from "@itsmworkbench/ticketsource";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useSystems} from "@itsmworkbench/system";
import {useAttributeValueComponents, useRenderers} from "@itsmworkbench/renderers";


export const SelectKnowledgeArticleTicketWizardPage: WizardPanel<Ticket> = ({
                                                                                name,
                                                                                description,
                                                                                steps,
                                                                                ops,
                                                                                stepOps
                                                                            }: WizardPanelProps<Ticket>) => {
    const {H1} = useRenderers()
    const {DataLayout, Text} = useAttributeValueComponents()
    const {ClipHeight,Table} = useCommonComponents()
    const [ticket] = ops
    const ticketSources = useTicketSources();
    const {NavPanelLayout, NavPanel} = useCommonComponents()
    const systems = useSystems()
    const systemNames = Object.keys(systems)
    const rootId = 'select-knowledge-article-ticket-wizard'
    return <>
        <div data-testid={rootId}>
            <DataLayout rootId={rootId} layout={[1,1,1,1]}>
                <H1 rootId={rootId} attribute='ticket' value='Ticket'/>
                <Text rootId={rootId} attribute='id' value={ticket.id}/>
                <Text rootId={rootId} attribute='summary' value={ticket.summary}/>
                <ClipHeight maxHeight='200px'>
                    <Text rootId={rootId} attribute='description' value={ticket.description}/>
                </ClipHeight>
            </DataLayout>
        </div>

    </>

}
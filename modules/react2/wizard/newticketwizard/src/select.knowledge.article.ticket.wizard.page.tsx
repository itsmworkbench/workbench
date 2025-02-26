import {nextWizardStep, WizardPanel, WizardPanelProps} from "@itsmworkbench/wizard";
import React from "react";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useAttributeValueComponents, useRenderers} from "@itsmworkbench/renderers";
import {useTranslation} from "@itsmworkbench/translation";
import {Ticket} from "@itsmworkbench/tickets";
import {ListKasForSelection} from "./listKasForSelection";
import {WizardPrevButton} from "@itsmworkbench/wizard/src/simple.wizard.next.prev.footer";
import {useItsmState, useItsmStateKaDetails, useItsmStateTicket} from "@itsmworkbench/itsm_state";


export const SelectKnowledgeArticleTicketWizardPage: WizardPanel<Ticket> = ({
                                                                                name,
                                                                                description,
                                                                                steps,
                                                                                ops,
                                                                                stepOps,
                                                                                onFinish
                                                                            }: WizardPanelProps<Ticket>) => {
    const {H1} = useRenderers()
    const {DataLayout, Text, Json} = useAttributeValueComponents()
    const {ClipHeight, TwoColumnAndRestLayout} = useCommonComponents()
    const [newTicketData] = useItsmState()
    const [ticket] = useItsmStateTicket()
    const rootId = 'select-knowledge-article-ticket-wizard'
    const translation = useTranslation()
    const translate = useTranslation()
    const [selected, setSelect] = useItsmStateKaDetails()

    function newKa() {
        nextWizardStep(steps, stepOps)
        setSelect(undefined)
    }

    return <>
        <TwoColumnAndRestLayout>
            <div><DataLayout rootId={rootId} layout={[1, 1, 1, 1, 1]}>
                <H1 rootId={rootId} attribute='newTicket.ticket' value={translation('newTicket.ticket')}/>
                <Text rootId={rootId} attribute='newTicket.id' value={ticket.id}/>
                <Text rootId={rootId} attribute='newTicket.summary' value={ticket.summary}/>
                <ClipHeight maxHeight='200px'>
                    <Text rootId={rootId} attribute='newTicket.description' value={ticket.description}/>
                </ClipHeight>
            </DataLayout>
                <div>
                    <WizardPrevButton steps={steps} stepOps={stepOps}/>
                    <button disabled={selected === undefined} onClick={onFinish}>Finished</button>
                </div>
            </div>
            <>
                <button onClick={newKa}>{translate('newTicket.newKa')}</button>
                <ListKasForSelection system={newTicketData.system} organisation={'me'} onSelect={(kad) => setSelect(kad)}/>
            </>
        </TwoColumnAndRestLayout>

    </>

}
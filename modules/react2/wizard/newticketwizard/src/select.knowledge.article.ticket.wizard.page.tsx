import {nextWizardStep, WizardPanel, WizardPanelProps} from "@itsmworkbench/wizard";
import React, {useState} from "react";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useAttributeValueComponents, useRenderers} from "@itsmworkbench/renderers";
import {useTranslation} from "@itsmworkbench/translation";
import {Ticket} from "@itsmworkbench/tickets";
import {ListKasForSelection} from "./listKasForSelection";
import {WizardPrevButton} from "@itsmworkbench/wizard/src/simple.wizard.next.prev.footer";
import {useItsmState, useItsmStateKaDetails, useItsmStateTicket} from "@itsmworkbench/itsm_state";
import {DisplayKnowledgeArticleStatus, DisplayPhaseAction} from "@itsmworkbench/react_knowledgearticle/src/display.knowledge.article";
import {PhaseName, PhaseStatus} from "@itsmworkbench/domain";


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
    const [selPhase, setSelPhase] = useState<string | undefined>(undefined)
    const [selAction, setSelAction] = useState<string | undefined>(undefined)
    const [kad] = useItsmStateKaDetails()

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
            {kad.ka && <DisplayKnowledgeArticleStatus ka={kad.ka} status={{} as PhaseStatus} onClick={(phase, action) => {
                setSelPhase(phase)
                setSelAction(action)
            }}/>}
            {kad.ka && selPhase && selAction && <DisplayPhaseAction ka={kad.ka} phaseName={selPhase as PhaseName} action={selAction}/>}
            <pre>{JSON.stringify(kad)}</pre>
        </TwoColumnAndRestLayout>

    </>

}
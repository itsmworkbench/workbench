import {nextWizardStep, WizardPanel, WizardPanelProps, WizardPrevButton} from "@itsmworkbench/wizard";
import React, {useMemo, useState} from "react";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useAttributeValueComponents, useRenderers} from "@itsmworkbench/renderers";
import {useTranslation} from "@itsmworkbench/translation";
import {Ticket} from "@itsmworkbench/tickets";
import {ListKasForSelection2, loadAiSuggestion, LoadAiSuggestionProps} from "./listKasForSelection";
import {useItsmState, useItsmStateKaDetails, useItsmStateTicket} from "@itsmworkbench/itsm_state";
import {DisplayKnowledgeArticleStatus, DisplayPhaseAction} from "@itsmworkbench/react_knowledgearticle";
import {PhaseName, PhaseStatus} from "@itsmworkbench/domain";
import {EntitiesForKa} from "./entities.for.ka";
import {KADetails} from "@itsmworkbench/knowledgearticle";
import {GetterSetter} from "@itsmworkbench/react_utils";
import {useChatCompletion} from "@itsmworkbench/ai2_react";
import {LoadingErrorsOr, useKleisli} from "@itsmworkbench/loading";
import {NamedUrl} from "@itsmworkbench/urlstore";

export type DisplayTicketProps = {
    rootId: string
    ticket: Ticket
}

export function DisplayTicket({rootId, ticket}: DisplayTicketProps) {
    const {H1} = useRenderers()
    const translate = useTranslation()
    const {DataLayout, Text, Json} = useAttributeValueComponents()
    const {ClipHeight, TwoColumnAndRestLayout} = useCommonComponents()
    return <DataLayout rootId={rootId} layout={[1, 1, 1, 1, 1]}>
        <H1 rootId={rootId} attribute={translate('newTicket.ticket')} value={translate('newTicket.ticket')}/>
        <Text rootId={rootId} attribute={translate('newTicket.id')} value={ticket.id}/>
        <Text rootId={rootId} attribute={translate('newTicket.summary')} value={ticket.summary}/>
        <ClipHeight maxHeight='200px'>
            <Text rootId={rootId} attribute={translate('newTicket.description')} value={ticket.description}/>
        </ClipHeight>
    </DataLayout>
}

export type PrevNextNewProps = {
    steps: string[]
    stepOps: GetterSetter<string>
    onFinish: () => void
    selected: KADetails | undefined
    setSelect: (ka: KADetails | undefined) => void
}

function PrevNextNew({steps, stepOps, onFinish, selected, setSelect}: PrevNextNewProps) {
    const translate = useTranslation()

    function newKa() {
        nextWizardStep(steps, stepOps)
        setSelect(undefined)
    }

    return <div>
        <WizardPrevButton steps={steps} stepOps={stepOps}/>
        <button disabled={selected === undefined} onClick={onFinish}>Finished</button>
        <button onClick={newKa}>{translate('newTicket.newKa')}</button>
    </div>
}

export type KadsProps = {
    selectedKadOps: GetterSetter<KADetails>
}

export function DisplayKads({selectedKadOps}: KadsProps) {
    const [selPhase, setSelPhase] = useState<string | undefined>(undefined)
    const [selAction, setSelAction] = useState<string | undefined>(undefined)
    const [selectedKad, setSelect] = selectedKadOps
    return <>   {selectedKad?.ka && <DisplayKnowledgeArticleStatus ka={selectedKad.ka} status={{} as PhaseStatus} onClick={(phase, action) => {
        setSelPhase(phase)
        setSelAction(action)
    }}/>}
        {selectedKad?.ka && selPhase && selAction && <DisplayPhaseAction ka={selectedKad.ka} phaseName={selPhase as PhaseName} action={selAction}/>}
        <pre>{JSON.stringify(selectedKad)}</pre>
    </>
}

export const SelectKnowledgeArticleTicketWizardPage: WizardPanel<Ticket> = ({
                                                                                name,
                                                                                description,
                                                                                steps,
                                                                                ops,
                                                                                stepOps,
                                                                                onFinish
                                                                            }: WizardPanelProps<Ticket>) => {
    const {TwoColumnAndRestLayout} = useCommonComponents()
    const [kads, setKads] = useState<KADetails[]>([])
    const [newTicketData] = useItsmState()
    const [ticket] = useItsmStateTicket()
    const selectedKadOps = useItsmStateKaDetails()
    const [kaDetail, setKaDetails] = selectedKadOps
    const translate = useTranslation()
    const selectedKaRowOps = useState(-1)
    const chatCompletion = useChatCompletion()
    const query: LoadAiSuggestionProps = useMemo(() => ({kaDetails: kads, ticket: ticket, chatCompletion}), [kads, ticket, chatCompletion])
    const useAiSelection = (data: string) => () => {
        const index = kads.findIndex(ka => ka.name === data)
        selectedKaRowOps[1](index)
        setKaDetails(kads[index])
    }
    return <>
        <TwoColumnAndRestLayout>
            <div>
                <DisplayTicket rootId={`select-knowledge-article-ticket-wizard.display-ticket`} ticket={ticket}/>
                <PrevNextNew steps={steps} stepOps={stepOps} onFinish={onFinish} selected={kaDetail} setSelect={setKaDetails}/>
            </div>
            <div>
                <button onClick={() => {
                    selectedKaRowOps[1](-1)
                    selectedKadOps[1](old => ({...old, ka: undefined}));
                }}>{translate('newTicket.reset')}</button>
                <LoadingErrorsOr input={query} kleisli={loadAiSuggestion}>{data =>
                    <div>Ai suggests: {data}
                        <button onClick={useAiSelection(data)}>Use Ai Selection</button>
                    </div>}</LoadingErrorsOr>
                <ListKasForSelection2 organisation={'me'} system={newTicketData.system} selectedRowOps={selectedKaRowOps} onSelect={setKaDetails} onLoad={setKads}/>
            </div>
        </TwoColumnAndRestLayout>
        <EntitiesForKa kaOps={selectedKadOps}/>
        <DisplayKads selectedKadOps={selectedKadOps}/>
    </>
}
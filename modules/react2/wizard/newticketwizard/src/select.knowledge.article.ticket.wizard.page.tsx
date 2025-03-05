import {nextWizardStep, WizardPanel, WizardPanelProps, WizardPrevButton} from "@itsmworkbench/wizard";
import React, {useMemo, useState} from "react";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useAttributeValueComponents, useRenderers} from "@itsmworkbench/renderers";
import {useTranslation} from "@itsmworkbench/translation";
import {Ticket} from "@itsmworkbench/tickets";
import {ListKasForSelection2, loadAiSuggestion, LoadAiSuggestionProps} from "./listKasForSelection";
import {useItsmState, useItsmStateKaDetails, useItsmStateTicket} from "@itsmworkbench/itsm_state";
import {DisplayKads, DisplayKnowledgeArticleStatus, DisplayPhaseAction} from "@itsmworkbench/react_knowledgearticle";
import {PhaseName, PhaseStatus} from "@itsmworkbench/domain";
import {KADetails} from "@itsmworkbench/knowledgearticle";
import {GetterSetter, useDebug} from "@itsmworkbench/react_utils";
import {useChatCompletion} from "@itsmworkbench/ai2_react";
import {LoadingErrorsOr} from "@itsmworkbench/loading";
import {LoadAndEditItsmTicketAttributes} from "@itsmworkbench/itsm_state/src/itsmTicketAttributes";
import {NameAnd} from "@itsmworkbench/utils";
import {aiDebugName} from "@itsmworkbench/ai2";

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

const emptyVariables=[]

export const SelectKnowledgeArticleTicketWizardPage: WizardPanel<Ticket> = ({
                                                                                name,
                                                                                description,
                                                                                steps,
                                                                                ops,
                                                                                stepOps,
                                                                                onFinish
                                                                            }: WizardPanelProps<Ticket>) => {
    const debug = useDebug(aiDebugName)
    const {TwoColumnAndRestLayout} = useCommonComponents()
    const [kads, setKads] = useState<KADetails[]>([])
    const [newTicketData] = useItsmState()
    const [ticket, setTicket] = useItsmStateTicket()
    const selectedKadOps = useItsmStateKaDetails()
    const [kaDetail, setKaDetails] = selectedKadOps
    const translate = useTranslation()
    const selectedKaRowOps = useState(-1)
    const [selectedKaRow, setSelectedKaRow] = selectedKaRowOps
    const chatCompletion = useChatCompletion()
    const aiSuggestionQuery: LoadAiSuggestionProps = useMemo(() => ({kaDetails: kads, ticket: ticket, chatCompletion}), [kads, ticket, chatCompletion])
    const attributeOps = useState<NameAnd<string>>({})

    const useAiSelection = (data: string) => () => {
        const index = kads.findIndex(ka => ka.name === data)
        selectedKaRowOps[1](index)
        setKaDetails(kads[index])
    }

    function PrevNextNew() {
        function newKa() {
            nextWizardStep(steps, stepOps)
            setSelectedKaRow(undefined)
        }

        function finish() {
            onFinish()
            setTicket({...ticket, attributes: attributeOps[0]})
        }

        return <div>
            <WizardPrevButton steps={steps} stepOps={stepOps}/>
            <button disabled={kads[selectedKaRow] === undefined} onClick={finish}>Finished</button>
            <button onClick={newKa}>{translate('newTicket.newKa')}</button>
        </div>
    }


    return <>
        <TwoColumnAndRestLayout>
            <div>
                <DisplayTicket rootId={`select-knowledge-article-ticket-wizard.display-ticket`} ticket={ticket}/>
                <PrevNextNew/>
            </div>
            <div>
                <button onClick={() => {
                    selectedKaRowOps[1](-1)
                    selectedKadOps[1](old => ({...old, ka: undefined}));
                }}>{translate('newTicket.reset')}</button>
                <LoadingErrorsOr input={aiSuggestionQuery} kleisli={loadAiSuggestion}>{data =>
                    <div>Ai suggests: {data}
                        <button onClick={useAiSelection(data)}>Use Ai Selection</button>
                    </div>}</LoadingErrorsOr>
                <ListKasForSelection2 organisation={'me'} system={newTicketData.system} selectedRowOps={selectedKaRowOps} onSelect={setKaDetails} onLoad={setKads}/>
            </div>
        </TwoColumnAndRestLayout>
        <TwoColumnAndRestLayout>
            <LoadAndEditItsmTicketAttributes attributeNames={kaDetail.ka?.variables || emptyVariables} ticket={ticket} rootId='itsm.ticket.attributes' attributeOps={attributeOps}/>
        </TwoColumnAndRestLayout>
        <DisplayKads selectedKadOps={selectedKadOps}/>
    </>
}
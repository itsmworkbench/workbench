import {nextWizardStep, WizardPanel, WizardPanelProps, WizardPrevButton} from "@itsmworkbench/wizard";
import React, {useMemo, useState} from "react";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useAttributeValueComponents, useRenderers} from "@itsmworkbench/renderers";
import {useTranslation} from "@itsmworkbench/translation";
import {Ticket} from "@itsmworkbench/tickets";
import {ListKasForSelection2, loadAiSuggestion, LoadAiSuggestionProps} from "./listKasForSelection";
import {useItsmState, useItsmStateKaDetails, useItsmStateTicket} from "@itsmworkbench/itsm_state";
import {DisplayKads} from "@itsmworkbench/react_knowledgearticle";
import {KADetails} from "@itsmworkbench/knowledgearticle";
import {useDebug} from "@itsmworkbench/react_utils";
import {useChatCompletion} from "@itsmworkbench/ai2_react";
import {LoadingErrorsOr} from "@itsmworkbench/loading";
import {LoadAndEditItsmTicketAttributes} from "@itsmworkbench/itsm_state/src/itsmTicketAttributes";
import {NameAnd} from "@itsmworkbench/utils";
import {aiDebugName} from "@itsmworkbench/ai2";
import {justErrors} from "@itsmworkbench/loading/src/helpers";

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

const emptyVariables = []

export const SelectKnowledgeArticleTicketWizardPage: WizardPanel<Ticket> = ({
                                                                                name,
                                                                                description,
                                                                                steps,
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
        debug('useAiSelection', data)
        const index = kads.findIndex(ka => ka.name === data)
        selectedKaRowOps[1](index)
        setKaDetails(kads[index])
    }

    function newKa() {
        nextWizardStep(steps, stepOps)
        setSelectedKaRow(undefined)
    }

    function PrevNextNew() {
        function finish() {
            onFinish({...ticket, attributes: attributeOps[0]})
        }

        return <div>
            <WizardPrevButton steps={steps} stepOps={stepOps}/>
            <button disabled={kads[selectedKaRow] === undefined} onClick={finish}>Finished</button>

        </div>
    }

    function selectAiSuggestion(data: string) {
        const index = kads.findIndex(ka => ka.name === data)
        if (index === -1) return
        selectedKaRowOps[1](index)
        setKaDetails(kads[index])
    }

    const actualLoadAiSuggestion = useMemo(() => loadAiSuggestion(debug), [debug])

    return <>
        <TwoColumnAndRestLayout>
            <div>
                <DisplayTicket rootId={`select-knowledge-article-ticket-wizard.display-ticket`} ticket={ticket}/>
                <PrevNextNew/>
            </div>
            <div>

                <ListKasForSelection2 organisation={'me'} system={newTicketData.system} selectedRowOps={selectedKaRowOps} onSelect={setKaDetails} onLoad={setKads}>
                    <span>Ai suggests: <LoadingErrorsOr input={aiSuggestionQuery} Error={justErrors} onLoad={selectAiSuggestion} kleisli={actualLoadAiSuggestion}>{aiSuggestion =>
                        <>{aiSuggestion}
                            <button onClick={useAiSelection(aiSuggestion)}>Use Ai Selection</button>
                        </>
                    }</LoadingErrorsOr>
                    </span>
                    <button onClick={newKa}>{translate('newTicket.newKa')}</button>
                    <button onClick={() => {
                        selectedKaRowOps[1](-1)
                        selectedKadOps[1](old => ({...old, ka: undefined}));
                    }}>{translate('newTicket.reset')}</button>
                </ListKasForSelection2>
            </div>
        </TwoColumnAndRestLayout>
        <TwoColumnAndRestLayout>
            <LoadAndEditItsmTicketAttributes attributeNames={kaDetail.ka?.variables || emptyVariables} ticket={ticket} rootId='itsm.ticket.attributes' attributeOps={attributeOps}/>
        </TwoColumnAndRestLayout>
        <DisplayKads selectedKadOps={selectedKadOps}/>
    </>
}
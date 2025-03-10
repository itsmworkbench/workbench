import {nextWizardStep, WizardPanel, WizardPanelProps} from "@itsmworkbench/wizard";
import {Ticket} from "@itsmworkbench/tickets";
import React from "react";
import {useTicketSources} from "@itsmworkbench/ticketsource";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useSystems} from "@itsmworkbench/system";
import {useRenderers} from "@itsmworkbench/renderers";
import {useItsmStateSource, useItsmStateSystem, useItsmStateTicket} from "@itsmworkbench/itsm_state";
import {useTranslation} from "@itsmworkbench/translation";


export const CreateTicketWizardPage: WizardPanel<Ticket> = ({
                                                                name,
                                                                description,
                                                                steps,
                                                                stepOps
                                                            }: WizardPanelProps<Ticket>) => {
    const {H1} = useRenderers()
    const ticketSources = useTicketSources();
    const {NavPanelLayout, NavPanel, ClipHeight} = useCommonComponents()
    const systems = useSystems()
    const systemNames = Object.keys(systems)
    const sourceOps = useItsmStateSource()
    const systemOps = useItsmStateSystem()
    const ticketSource = ticketSources[sourceOps[0]]
    const systemName = systemOps[0]
    const [_, setTicket] = useItsmStateTicket()
    const onCreated = (ticket: Ticket) => {
        setTicket(ticket)
        nextWizardStep(steps, stepOps)
    }
    const translate = useTranslation()
    const rootId = 'create-ticket-wizard'
    return <>
        <H1 rootId={rootId} attribute='systems' value={translate('createTicket.systems')}/>
        <ClipHeight maxHeight='300px'>
            <NavPanelLayout>{Object.entries(systems).map(([name, system]) =>
                <NavPanel key={name} size='medium' name={name} description={system.description} ops={systemOps}/>)}</NavPanelLayout>
        </ClipHeight>
        {/*<H1 rootId={rootId} attribute='ticketSources' value={translate('createTicket.ticketSources')}/>*/}
        {/*<NavPanelLayout>{Object.entries(ticketSources).map(([name, panel]) =>*/}
        {/*    <NavPanel key={name} size='medium' name={name} description={panel.description} ops={sourceOps}/>)}</NavPanelLayout>*/}
        {ticketSource && systemName && <>
            <H1 rootId={rootId} attribute='ticket' value={translate('createTicket.tickets')}/>
            <ticketSource.Display config={ticketSource.config} systemName={systemName} onCreated={onCreated}/>
        </>}
    </>

}
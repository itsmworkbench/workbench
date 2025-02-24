import {nextWizardStep, WizardPanel, WizardPanelProps} from "@itsmworkbench/wizard";
import {Ticket} from "@itsmworkbench/tickets";
import React from "react";
import {useTicketSources} from "@itsmworkbench/ticketsource";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useSystems} from "@itsmworkbench/system";
import {useRenderers} from "@itsmworkbench/renderers";
import {useNewTicketSource, useNewTicketSystem, useNewTicketTicket} from "./new.ticket.wizard";


export const CreateTicketWizardPage: WizardPanel<Ticket> = ({
                                                                name,
                                                                description,
                                                                steps,
                                                                ops,
                                                                stepOps
                                                            }: WizardPanelProps<Ticket>) => {
    const {H1} = useRenderers()
    const ticketSources = useTicketSources();
    const {NavPanelLayout, NavPanel} = useCommonComponents()
    const systems = useSystems()
    const systemNames = Object.keys(systems)
    const sourceOps = useNewTicketSource()
    const systemOps = useNewTicketSystem()
    const ticketSource = ticketSources[sourceOps[0]]
    const systemName = systemOps[0]
    const [_, setTicket] = useNewTicketTicket()
    const onCreated = (ticket: Ticket) => {
        setTicket(ticket)
        nextWizardStep(steps, stepOps)
    }
    const rootId = 'create-ticket-wizard'
    return <>
        <div>
            <H1 rootId={rootId} attribute='systems' value='Systems'/>
            <NavPanelLayout>{Object.entries(systems).map(([name, system]) =>
                <NavPanel key={name} size='medium' name={name} description={system.description} ops={systemOps}/>)}</NavPanelLayout>
            <H1 rootId={rootId} attribute='ticketSources' value='Ticket Source'/>
            <NavPanelLayout>{Object.entries(ticketSources).map(([name, panel]) =>
                <NavPanel key={name} size='medium' name={name} description={panel.description} ops={sourceOps}/>)}</NavPanelLayout>
            {ticketSource && systemName && <>
                <H1 rootId={rootId} attribute='ticket' value='Ticket'/>
                <ticketSource.Display config={ticketSource.config} systemName={systemName} onCreated={onCreated}/>
            </>}
        </div>
    </>

}
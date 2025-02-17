import {nextWizardStep, WizardPanel, WizardPanelProps} from "@itsmworkbench/wizard";
import {Ticket} from "@itsmworkbench/tickets";
import React, {useState} from "react";
import {useTicketSources} from "@itsmworkbench/ticketsource";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useSystems} from "@itsmworkbench/system";
import {useRenderers} from "@itsmworkbench/renderers";


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
    const sourceOps = useState(Object.keys(ticketSources)[0])
    const systemOps = useState(systemNames[0])
    const ticketSource = ticketSources[sourceOps[0]]
    const systemName = systemOps[0]
    const onCreated = (ticket: Ticket) => {
        ops[1](ticket)
        nextWizardStep(steps, stepOps)
    }
    const rootId = 'create-ticket-wizard'
    return <>
        <div>
            <H1 rootId={rootId} attribute='systems' value='Systems'/>
            <NavPanelLayout>{Object.entries(systems).map(([name, system]) =>
                <NavPanel key={name} size='small' name={name} description={system.description} ops={systemOps}/>)}</NavPanelLayout>
            <H1 rootId={rootId} attribute='ticketSources' value='Ticket Source'/>
            <NavPanelLayout>{Object.entries(ticketSources).map(([name, panel]) =>
                <NavPanel key={name} size='small' name={name} description={panel.description} ops={sourceOps}/>)}</NavPanelLayout>
            {ticketSource && systemName && <>
                <H1 rootId={rootId} attribute='ticket' value='Ticket'/>
                <ticketSource.Display config={ticketSource.config} systemName={systemName} onCreated={onCreated}/>
            </>}
        </div>
    </>

}
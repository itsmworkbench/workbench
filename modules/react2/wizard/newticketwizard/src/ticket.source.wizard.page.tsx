import {WizardPanel, WizardPanelProps} from "@itsmworkbench/wizard";
import {Ticket} from "@itsmworkbench/tickets";
import React from "react";
import {useTicketSources} from "@itsmworkbench/ticketsource";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useNewTicketData} from "./new.ticket.wizard";


export const TicketSourceWizardPage: WizardPanel<Ticket> = ({
                                                                name,
                                                                description,
                                                                steps,
                                                                ops,
                                                                stepOps
                                                            }: WizardPanelProps<Ticket>) => {
    const [step, setStep] = stepOps;
    const index = steps.indexOf(step);
    const nextIndex = index + 1;

    const ticketSources = useTicketSources()
    const {NavPanelLayout, NavPanel} = useCommonComponents()
    const newTicketOps = useNewTicketData()

    const onSelected = (name: string) => {
        const next = steps[nextIndex];
        console.log('onSelected', name, next)
        setStep(next)
    }
    return <NavPanelLayout>{Object.entries(ticketSources).map(([name, panel]) => {
        return <NavPanel key={name} name={name} description={panel.description} ops={newTicketOps} onSelected={onSelected}/>
    })}</NavPanelLayout>

}
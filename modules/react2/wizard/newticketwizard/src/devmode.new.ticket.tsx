import {DevModeComponent} from "@itsmworkbench/devmode";
import {useNewTicketTicket, useNewTicketWizardData} from "./new.ticket.wizard";
import React from "react";

export const devmodeNewTicketName = 'newTicket'
export const DevModeNewTicket: DevModeComponent = () => {
    const [newTicket] = useNewTicketWizardData()
    return <pre>{JSON.stringify(newTicket, null, 2)}</pre>
}
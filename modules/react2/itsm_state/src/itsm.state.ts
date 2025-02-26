import {Ticket} from "@itsmworkbench/tickets";
import {KADetails} from "@itsmworkbench/knowledgearticle";
import {makeContextForState, makeUseStateChild} from "@itsmworkbench/react_utils";
import {makeSovereignStatePlugin, SovereignStatePlugin} from "@itsmworkbench/sovereign";
import {NewTicketSovereignPane} from "@itsmworkbench/newticket_wizard/src/new.ticket.wizard";

export type ItsmState = {
    source: string
    system: string
    ticket: Ticket
    ka: KADetails
}
export const emptyItsmState: ItsmState = {system: '', source: '', ticket: {} as Ticket, ka: {} as KADetails}

export const {use: useItsmState, Provider: ItsmStateProvider} = makeContextForState<ItsmState, 'state'>('state')
export const useItsmStateSource = makeUseStateChild(useItsmState, id => id.focusOn('source'))
export const useItsmStateSystem = makeUseStateChild(useItsmState, id => id.focusOn('system'))
export const useItsmStateTicket = makeUseStateChild(useItsmState, id => id.focusOn('ticket'))
export const useItsmStateKaDetails = makeUseStateChild(useItsmState, id => id.focusOn('ka'))

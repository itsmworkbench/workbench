import {Ticket} from "@itsmworkbench/tickets";
import {KADetails} from "@itsmworkbench/knowledgearticle";
import {makeContextForState, makeUseStateChild} from "@itsmworkbench/react_utils";
import {PhaseStatus} from "@itsmworkbench/domain";
import {ChatCompletionMessage} from "@itsmworkbench/ai2";

export type ApprovedState = 'preApproved' | 'noApprovalNeeded' | 'needsApproval' | 'approved' | 'rejected'

export type TicketProgress = {
    approved: ApprovedState | 'unknown';
    issueDemonstrated: boolean
    issueResolved: boolean
    issueClosed: boolean
}
export const emptyTicketProgress: TicketProgress = {
    approved: 'unknown',
    issueDemonstrated: false,
    issueResolved: false,
    issueClosed: false
}

export type ItsmState = {
    source: string
    system: string
    ticket: Ticket
    progress: TicketProgress
    ticketState: ActiveTicketState
    ka: KADetails
    status: PhaseStatus

}
export type ActiveTicketState = {
    query: string
    activeCanvas: string
    messages: ChatCompletionMessage[]
}
export const emptyActiveTicketState: ActiveTicketState = {query: '', messages: [], activeCanvas: 'help'}

export const emptyItsmState: ItsmState = {system: '', source: '', ticket: {} as Ticket, ka: {} as KADetails, status: {} as PhaseStatus, progress: emptyTicketProgress, ticketState: emptyActiveTicketState}

export const {use: useItsmState, Provider: ItsmStateProvider} = makeContextForState<ItsmState, 'state'>('state')
export const useItsmStateSource = makeUseStateChild(useItsmState, id => id.focusOn('source'))
export const useItsmStateSystem = makeUseStateChild(useItsmState, id => id.focusOn('system'))
export const useItsmStateTicket = makeUseStateChild(useItsmState, id => id.focusOn('ticket'))
export const useItsmStateTicketAttributes = makeUseStateChild(useItsmState, id => id.focusOn('ticket').focusOn('attributes'))
export const useItsmStateKaDetails = makeUseStateChild(useItsmState, id => id.focusOn('ka'))
export const useItsmStateStatus = makeUseStateChild(useItsmState, id => id.focusOn('status'))
export const useItsmStateProgress = makeUseStateChild(useItsmState, id => id.focusOn('progress'))
export const useItsmTicketState = makeUseStateChild(useItsmState, id => id.focusOn('ticketState'))

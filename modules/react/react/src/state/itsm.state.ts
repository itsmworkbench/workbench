import { DebugState, EventsAndEnriched, SideEffect, SideeffectResult, TabPhaseAndActionSelectionState } from "@itsmworkbench/react_core";
import { Lens, Lenses, Optional } from "@focuson/lens";
import { ColumnLeftMainState } from "@itsmworkbench/components";
import { ChatDisplayData, Conversation, PhaseAnd } from "@itsmworkbench/domain";
import { ListNamesResult } from "@itsmworkbench/url";
import { NameAnd } from "@laoban/utils";
import { Variables } from "@itsmworkbench/variables";
import { NewTicketData, NewTicketState, NewTicketWizardData } from "@itsmworkbench/react_new_ticket";
import { Operator } from "@itsmworkbench/operator";
import { Event } from "@itsmworkbench/events";
import { Ticket } from "@itsmworkbench/tickets";
import { EmailResult, TicketVariables } from "@itsmworkbench/ai_ticketvariables";
import { DisplayTicketListSelectionState } from "@itsmworkbench/react_ticket";
import { defaultTicketTypeDetails, TicketType, TicketTypeDetails } from "@itsmworkbench/tickettype";
import { EmailTempData, LdapData, SqlData ,KnowledgeArticleTempData} from "@itsmworkbench/react_capabilities";

export interface ItsmSelectionState extends DisplayTicketListSelectionState<TabPhaseAndActionSelectionState>, NewTicketState {
  mainScreen?: ColumnLeftMainState
  ticketId?: string
  tabs?: TabPhaseAndActionSelectionState
}
export type TicketAndId = { id?: string, ticket?: Ticket }
export interface TempData {
  newTicket: NewTicketData
  sqlData: SqlData
  ldapData: LdapData
  emailData: EmailTempData
  emailResult: EmailResult
  newTicketWizard: NewTicketWizardData
  ka: KnowledgeArticleTempData
}

export interface Blackboard {
  operator: Operator
  ticketType: {
    ticketType: TicketType,
    ticketTypeDetails: TicketTypeDetails
  },
  status: PhaseAnd<NameAnd<boolean>>
}

export interface ItsmState {
  events: EventsAndEnriched,
  blackboard: Blackboard
  tempData: TempData
  ticketList: ListNamesResult
  conversation: Conversation
  selectionState: ItsmSelectionState
  ticket?: Ticket
  sideeffects: SideEffect[]
  log: SideeffectResult<any>[],
  variables: NameAnd<Variables>
  debug?: DebugState
}

const newTicket: NewTicketData = { organisation: 'me', name: '', ticket: '', ticketType: defaultTicketTypeDetails };


export const startAppState: ItsmState = {
  blackboard: {} as any,
  ticketList: undefined as any,
  sideeffects: [],
  events: { events: [], enrichedEvents: [] },
  log: [],
  conversation: { messages: [], chat: { type: '' } },
  variables: {},
  tempData: {
    newTicket,
  } as TempData,
  selectionState: {},
}

export const itsmIdL: Lens<ItsmState, ItsmState> = Lenses.identity ()
export const blackboardL: Lens<ItsmState, Blackboard> = itsmIdL.focusOn ( 'blackboard' )
export const selectionStateL: Lens<ItsmState, ItsmSelectionState> = itsmIdL.focusOn ( 'selectionState' )
export const operatorL: Lens<ItsmState, Operator> = blackboardL.focusOn ( 'operator' )
// export const setPageL: Optional<ItsmState, string> = itsmIdL.focusQuery ( 'selectionState' ).focusQuery ( 'workspaceTab' )
export const ticketIdL: Optional<ItsmState, string> = selectionStateL.focusQuery ( 'ticketId' )
export const newTicketL: Optional<ItsmState, NewTicketData> = itsmIdL.focusQuery ( 'tempData' ).focusQuery ( 'newTicket' )
export const ticketVariablesL: Optional<ItsmState, TicketVariables> = itsmIdL.focusQuery ( 'tempData' ).focusQuery ( 'newTicket' ).focusQuery ( 'aiAddedVariables' )
export const emailDataL: Optional<ItsmState, EmailTempData> = itsmIdL.focusQuery ( 'tempData' ).focusQuery ( 'emailData' )
export const chatDataL: Lens<ItsmState, ChatDisplayData<any>> = itsmIdL.focusOn ( 'conversation' ).focusOn ( 'chat' )
export const sideEffectsL: Lens<ItsmState, SideEffect[]> = itsmIdL.focusOn ( 'sideeffects' )
export const tabsL: Optional<ItsmState, TabPhaseAndActionSelectionState> = itsmIdL.focusQuery ( 'selectionState' ).focusQuery ( 'tabs' )
export const logsL: Lens<ItsmState, SideeffectResult<any>[]> = itsmIdL.focusOn ( 'log' )
export const eventsAndEnrichedL: Lens<ItsmState, EventsAndEnriched> = itsmIdL.focusOn ( 'events' )
export const eventsL: Lens<ItsmState, Event[]> = eventsAndEnrichedL.focusOn ( 'events' )
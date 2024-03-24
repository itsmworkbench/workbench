import { BasicData, DebugState, SideEffect, SideeffectResult, TabPhaseAndActionSelectionState } from "@itsmworkbench/react_core";
import { Lens, Lenses, Optional } from "@focuson/lens";
import { MainAppMainState } from "@itsmworkbench/components";
import { ChatDisplayData, Conversation, EmailTempData, LdapData, PhaseAnd, ReceiveEmailData, SqlData } from "@itsmworkbench/domain";
import { ListNamesResult } from "@itsmworkbench/urlstore";
import { NameAnd } from "@laoban/utils";
import { Variables } from "@itsmworkbench/variables";
import { NewTicketData, NewTicketState, NewTicketWizardData } from "@itsmworkbench/react_new_ticket";
import { Operator } from "@itsmworkbench/operator";
import { Event } from "@itsmworkbench/events";
import { Ticket } from "@itsmworkbench/tickets";
import { EmailResult, TicketVariables } from "@itsmworkbench/ai_ticketvariables";
import { DisplayTicketListSelectionState } from "@itsmworkbench/react_ticket";
import { defaultTicketTypeDetails, TicketType } from "@itsmworkbench/tickettype";
import { KnowledgeArticleTempData } from "@itsmworkbench/react_capabilities";
import { Action } from "@itsmworkbench/actions";
import { EnrichedEvent } from "@itsmworkbench/enrichedevents";
import { IdAnd } from "@itsmworkbench/utils";

export interface ItsmSelectionState extends DisplayTicketListSelectionState<TabPhaseAndActionSelectionState>, NewTicketState {
  mainScreen?: MainAppMainState
  ticketId?: string
  tabs?: TabPhaseAndActionSelectionState
}
export type TicketAndId = { id?: string, ticket?: Ticket }
export interface TempData {
  action: Action
  newTicket: NewTicketWizardData
  sqlData: SqlData
  ldapData: LdapData
  emailData: EmailTempData
  emailResult: EmailResult
  receiveEmailData: ReceiveEmailData
  ka: KnowledgeArticleTempData
  ticketType: IdAnd<TicketType>
}


//These are blown away every time we have a new ticket
//They are the 'data we know about this ticket'
export type ItsmStateDataForTicket = {
  // ticketType: TicketType, -- we don't need this because it's in the events
  events: Event[]
  enrichedEvents: EnrichedEvent<any, any>[] //The events enriched with local business knowledge. Especially useful for ids turned to values. But also 'should I hide this'
  ticket?: Ticket //This is a cache of what's in the events. It's not the source of truth
  variables: NameAnd<string> // things we can use in the templates. Also a cache
  status: PhaseAnd<NameAnd<boolean>>// more cached data
  tempData: TempData

}

export interface ItsmState {
  forTicket: ItsmStateDataForTicket
  basicData: BasicData
  ticketList: ListNamesResult
  kaList: ListNamesResult
  conversation: Conversation
  selectionState: ItsmSelectionState
  sideeffects: SideEffect[]
  log: SideeffectResult<any>[],
  variables: NameAnd<Variables>
  debug?: DebugState
}

const newTicket: NewTicketData = { organisation: 'me', name: '', ticket: '', ticketType: defaultTicketTypeDetails };

export const startAppState: ItsmState = {
  forTicket: {} as any,
  basicData: undefined as any,
  ticketList: undefined as any,
  kaList: undefined as any,
  sideeffects: [],
  log: [],
  conversation: { messages: [], chat: { type: '' } },
  variables: {},
  selectionState: {},
}

export const itsmIdL: Lens<ItsmState, ItsmState> = Lenses.identity ()
export const basicDataL: Lens<ItsmState, BasicData> = itsmIdL.focusOn ( 'basicData' )
export const selectionStateL: Lens<ItsmState, ItsmSelectionState> = itsmIdL.focusOn ( 'selectionState' )
export const operatorL: Lens<ItsmState, Operator> = basicDataL.focusOn ( 'operator' )
// export const setPageL: Optional<ItsmState, string> = itsmIdL.focusQuery ( 'selectionState' ).focusQuery ( 'workspaceTab' )
export const ticketIdL: Optional<ItsmState, string> = selectionStateL.focusQuery ( 'ticketId' )
let forTicketL = itsmIdL.focusOn ( 'forTicket' );
let tempDataL = forTicketL.focusQuery ( 'tempData' );
export const newTicketL: Optional<ItsmState, NewTicketWizardData> = tempDataL.focusQuery ( 'newTicket' )
export const ticketVariablesL: Optional<ItsmState, TicketVariables> = forTicketL.focusQuery ( 'variables' )

export const emailDataL: Optional<ItsmState, Action> = tempDataL.focusQuery ( 'action' )
export const chatDataL: Lens<ItsmState, ChatDisplayData<any>> = itsmIdL.focusOn ( 'conversation' ).focusOn ( 'chat' )
export const sideEffectsL: Lens<ItsmState, SideEffect[]> = itsmIdL.focusOn ( 'sideeffects' )
export const tabsL: Optional<ItsmState, TabPhaseAndActionSelectionState> = itsmIdL.focusQuery ( 'selectionState' ).focusQuery ( 'tabs' )
export const logsL: Lens<ItsmState, SideeffectResult<any>[]> = itsmIdL.focusOn ( 'log' )
export const eventsO: Optional<ItsmState, Event[]> = forTicketL.focusOn ( 'events' )
export const eventsL: Lens<ItsmState, Event[]> = forTicketL.focusOn ( 'events' )
export const enrichedEventsO: Optional<ItsmState, Event[]> = forTicketL.focusOn ( 'enrichedEvents' )
export const enrichedEventsL: Lens<ItsmState, Event[]> = forTicketL.focusOn ( 'enrichedEvents' )
export const statusL: Lens<ItsmState, PhaseAnd<NameAnd<boolean>>> = forTicketL.focusOn ( 'status' )
export const ticketListO: Optional<ItsmState, ListNamesResult> = itsmIdL.focusOn ( 'ticketList' )
export const actionO = forTicketL.focusOn('tempData').focusOn('action')
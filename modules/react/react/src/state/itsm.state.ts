import { DebugState, EventsAndEnriched, SideEffect, SideeffectResult, WorkspaceSelectionState } from "@itsmworkbench/react_core";
import { Lens, Lenses, Optional } from "@focuson/lens";
import { ColumnLeftMainState } from "@itsmworkbench/components";
import { ChatDisplayData, Conversation } from "@itsmworkbench/domain";
import { ListNamesResult } from "@itsmworkbench/url";
import { NameAnd } from "@laoban/utils";
import { Variables } from "@itsmworkbench/variables";
import { NewTicketData } from "@itsmworkbench/react_new_ticket";
import { Operator } from "@itsmworkbench/operator";
import { Event } from "@itsmworkbench/events";
import { Ticket } from "@itsmworkbench/tickets";
import { EnrichedEvent } from "@itsmworkbench/enrichedevents";
import { TicketVariables } from "@itsmworkbench/ai_ticketvariables";

export interface ItsmSelectionState extends WorkspaceSelectionState {
  mainScreen?: ColumnLeftMainState
  ticketId?: string
}
export type TicketAndId = { id?: string, ticket?: Ticket }
export interface TempData {
  newTicket: NewTicketData
}

export interface Blackboard {
  operator: Operator
}

export interface ItsmState {
  events: EventsAndEnriched,
  blackboard: Blackboard
  tempData: TempData
  ticketList: ListNamesResult
  conversation: Conversation
  selectionState: ItsmSelectionState
  sideeffects: SideEffect[]
  log: SideeffectResult<any>[],
  variables: NameAnd<Variables>
  debug?: DebugState
}

const newTicket: NewTicketData = { organisation: 'me', name: '', ticket: '' };


export const startAppState: ItsmState = {
  blackboard: {
    operator: undefined as any
  },
  ticketList: undefined as any,
  sideeffects: [],
  events: { events: [], enrichedEvents: [] },
  log: [],
  conversation: { messages: [], chat: { type: '' } },
  variables: {},
  tempData: {
    newTicket,
  },
  selectionState: {},
}

export const itsmIdL: Lens<ItsmState, ItsmState> = Lenses.identity ()
export const blackboardL: Lens<ItsmState, Blackboard> = itsmIdL.focusOn ( 'blackboard' )
export const selectionStateL: Lens<ItsmState, ItsmSelectionState> = itsmIdL.focusOn ( 'selectionState' )
export const operatorL: Lens<ItsmState, Operator> = blackboardL.focusOn ( 'operator' )
export const setPageL: Optional<ItsmState, string> = itsmIdL.focusQuery ( 'selectionState' ).focusQuery ( 'workspaceTab' )
export const ticketIdL: Optional<ItsmState, string> = selectionStateL.focusQuery ( 'ticketId' )
export const ticketVariablesL: Optional<ItsmState, TicketVariables> = itsmIdL.focusQuery ( 'tempData' ).focusQuery('newTicket').focusQuery('aiAddedVariables')
export const chatDataL: Lens<ItsmState, ChatDisplayData<any>> = itsmIdL.focusOn ( 'conversation' ).focusOn ( 'chat' )
export const sideEffectsL: Lens<ItsmState, SideEffect[]> = itsmIdL.focusOn ( 'sideeffects' )
export const logsL: Lens<ItsmState, SideeffectResult<any>[]> = itsmIdL.focusOn ( 'log' )
export const eventsAndEnrichedL: Lens<ItsmState, EventsAndEnriched> = itsmIdL.focusOn ( 'events' )
export const eventsL: Lens<ItsmState, Event[]> = eventsAndEnrichedL.focusOn ( 'events' )
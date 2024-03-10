import { DebugState, SideEffect, SideeffectResult, WorkspaceSelectionState } from "@itsmworkbench/react_core";
import { Lens, Lenses, Optional } from "@focuson/lens";
import { ColumnLeftMainState } from "@itsmworkbench/components";
import { ChatDisplayData, Conversation } from "@itsmworkbench/domain";
import { NamedLoadResult } from "@itsmworkbench/url";
import { ErrorsAnd, NameAnd } from "@laoban/utils";
import { Variables } from "@itsmworkbench/variables";
import { NewTicketData } from "@itsmworkbench/react_new_ticket";
import { Operator } from "@itsmworkbench/operator";
import { Ticket } from "@itsmworkbench/tickets";

export interface ItsmSelectionState extends WorkspaceSelectionState {
  mainScreen?: ColumnLeftMainState
}
export type TicketAndId = { id?: string, ticket?: Ticket }

export interface ItsmState {
  operator: ErrorsAnd<NamedLoadResult<Operator>>
  conversation: Conversation
  selectionState: ItsmSelectionState
  newTicket: NewTicketData
  ticket: TicketAndId,
  sideeffects: SideEffect[]
  log: SideeffectResult<any>[],
  variables: NameAnd<Variables>
  debug?: DebugState

}

const newTicket: NewTicketData = { organisation: 'me', name: '', ticket: '' };
export const startAppState: ItsmState = {
  operator: undefined as any,
  sideeffects: [],
  log: [],
  conversation: { messages: [], chat: { type: '' } },
  variables: {},
  ticket:{},
  newTicket,
  selectionState: {},
}

export const itsmIdL: Lens<ItsmState, ItsmState> = Lenses.identity ()
export const operatorL: Lens<ItsmState, ErrorsAnd<NamedLoadResult<Operator>>> = itsmIdL.focusOn ( 'operator' )
export const setPageL: Lens<ItsmState, string | undefined> = itsmIdL.focusOn ( 'selectionState' ).focusOn ( 'workspaceTab' )
export const ticketIdL: Optional<ItsmState, string|undefined > = itsmIdL.focusQuery ( 'ticket' ).focusOn ( 'id' )
export const chatDataL: Lens<ItsmState, ChatDisplayData<any>> =
               itsmIdL.focusOn ( 'conversation' ).focusOn ( 'chat' )
export const sideEffectsL: Lens<ItsmState, SideEffect[]> = itsmIdL.focusOn ( 'sideeffects' )
export const logsL: Lens<ItsmState, SideeffectResult<any>[]> = itsmIdL.focusOn ( 'log' )
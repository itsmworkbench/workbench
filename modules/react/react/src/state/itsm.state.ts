import { DebugState, SideEffect, SideeffectResult, WorkspaceSelectionState } from "@itsmworkbench/react_core";
import { Lens, Lenses } from "@focuson/lens";
import { ColumnLeftMainState } from "@itsmworkbench/components";
import { ChatDisplayData, Conversation } from "@itsmworkbench/domain";
import { UrlLoadResult } from "@itsmworkbench/url";
import { ErrorsAnd, NameAnd } from "@laoban/utils";
import { Variables } from "@itsmworkbench/variables";
import { NewTicketData } from "@itsmworkbench/react_new_ticket";
import { Operator } from "@itsmworkbench/operator";

export interface ItsmSelectionState extends WorkspaceSelectionState {
  mainScreen?: ColumnLeftMainState
}
export interface ItsmState {
  operator: ErrorsAnd<UrlLoadResult<Operator>>
  conversation: Conversation
  selectionState: ItsmSelectionState
  newTicket: NewTicketData
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
  newTicket,
  selectionState: {},
}

export const itsmIdL: Lens<ItsmState, ItsmState> = Lenses.identity ()
export const operatorL: Lens<ItsmState, ErrorsAnd<UrlLoadResult<Operator>>> = itsmIdL.focusOn ( 'operator' )
export const setPageL: Lens<ItsmState, string|undefined> = itsmIdL.focusOn ( 'selectionState' ).focusOn ( 'workspaceTab' )
export const chatDataL: Lens<ItsmState, ChatDisplayData<any>> =
               itsmIdL.focusOn ( 'conversation' ).focusOn ( 'chat' )
export const sideEffectsL: Lens<ItsmState, SideEffect[]> = itsmIdL.focusOn ( 'sideeffects' )
export const logsL: Lens<ItsmState, SideeffectResult<any>[]> = itsmIdL.focusOn ( 'log' )
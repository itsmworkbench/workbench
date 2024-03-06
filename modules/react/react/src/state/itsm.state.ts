import { DebugState, SideEffect, SideeffectResult, WorkspaceSelectionState } from "@itsmworkbench/react_core";
import { Lens, Lenses } from "@focuson/lens";
import { ColumnLeftMainState } from "@itsmworkbench/components";
import { Ticket } from "@itsmworkbench/tickets";
import { ChatDisplayData, Conversation, Operator } from "@itsmworkbench/domain";
import { UrlLoadResult } from "@itsmworkbench/url";
import { ErrorsAnd, NameAnd } from "@laoban/utils";
import { Variables } from "@itsmworkbench/variables";

export interface ItsmSelectionState extends WorkspaceSelectionState {
  mainScreen?: ColumnLeftMainState
}
export interface ItsmState {
  operator: ErrorsAnd<UrlLoadResult<Operator>>
  conversation: Conversation
  selectionState: ItsmSelectionState
  sideeffects: SideEffect[]
  log: SideeffectResult<any>[],
  variables: NameAnd<Variables>
  debug?: DebugState

}

export const startAppState: ItsmState = {
  operator: undefined as any,
  sideeffects: [],
  log: [],
  conversation: { messages: [], chat: { type: '' } },
  variables: {},
  selectionState: {},
}

export const itsmIdL: Lens<ItsmState, ItsmState> = Lenses.identity ()
export const operatorL: Lens<ItsmState, ErrorsAnd<UrlLoadResult<Operator>>> = itsmIdL.focusOn ( 'operator' )
export const chatDataL: Lens<ItsmState, ChatDisplayData<any>> =
               itsmIdL.focusOn ( 'conversation' ).focusOn ( 'chat' )
export const sideEffectsL: Lens<ItsmState, SideEffect[]> = itsmIdL.focusOn ( 'sideeffects' )
export const logsL: Lens<ItsmState, SideeffectResult<any>[]> = itsmIdL.focusOn ( 'log' )
import { SelectionState } from "../state/selection.state";
import { Conversation } from "@intellimaintain/domain";
import { Variables } from "@intellimaintain/variables";
import { NameAnd } from "@laoban/utils";
import { SideEffect, SideeffectResult } from "@intellimaintain/react_core";
import { KnowledgeArticles } from "@intellimaintain/react_knowledge_articles";
import { SoftwareCatalogs } from "@intellimaintain/react_softwarecatalog"
import { Tickets } from "@intellimaintain/react_ticket";
import { Lenses } from "@focuson/lens";
import { Templates } from "@intellimaintain/react_templates";


export interface ChatState {
  who: string
  selectionState: SelectionState
  sideeffects: SideEffect[]
  log: SideeffectResult<any>[]
  conversation: Conversation
  sql: string[]
  kas: KnowledgeArticles
  scs: SoftwareCatalogs
  templates: Templates
  variables: NameAnd<Variables>
  tickets: Tickets
  ticketState: NameAnd<boolean>
}
export const idL = Lenses.identity<DemoChatState> ()
export const chatState1L = idL.focusOn ( 'chatState1' )
export const sideEffects1L = chatState1L.focusOn ( 'sideeffects' )
export const logs1L = chatState1L.focusOn ( 'log' )

export const chatState2L = idL.focusOn ( 'chatState2' )
export const sideEffects2L = chatState2L.focusOn ( 'sideeffects' )
export const logs2L = chatState2L.focusOn ( 'log' )

export function blankChatState ( chatter: string, tickets: Tickets, kas: KnowledgeArticles, scs: SoftwareCatalogs, templates: Templates ): ChatState {
  return {
    who:chatter,
    selectionState: {},
    sideeffects: [],
    log: [],
    conversation: { messages: [], chatter },
    sql: [],
    kas,
    scs,
    templates,
    tickets,
    variables: {},
    ticketState: {}
  }
}

export interface DemoChatState {
  chatState1: ChatState
  chatState2: ChatState
}
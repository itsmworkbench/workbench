import { Conversation } from "@itsmworkbench/domain";
import { NameAnd } from "@laoban/utils";
import { Variables } from "@itsmworkbench/variables";

import { BaseAction, ActionStatus, calcStatusForWithBy } from "@itsmworkbench/actions";
import { LensState } from "@focuson/state";
import { KnowledgeArticle, KnowledgeArticles } from "@itsmworkbench/knowledge_articles";
import { derefence, dollarsBracesVarDefn } from "@laoban/variables";

import { uppercaseFirstLetter } from "@itsmworkbench/utils";
import { Templates } from "@itsmworkbench/templates";
import { SideEffect } from "./sideeffects";
import { SoftwareCatalogs } from "@itsmworkbench/softwarecatalog";

export interface WorkspaceSelectionState {
  workspaceTab?: string
}

export interface DebugState {
  showDevMode?: boolean
  selectedDebugTab?: string | undefined
}
//
// export function calculateActionDetails<S, S1 extends CommonStateForActionDetails> ( state: LensState<S, S1, any>, by: string ): ActionDetails {
//   let commonState = state.optJson ();
//   const knowledgeArticle: KnowledgeArticle | undefined = commonState?.kas?.item
//   const ticketState: NameAnd<boolean> = commonState?.ticketState || {}
//   const nameAndActionStatus = calcStatusForWithBy ( ticketState, by, knowledgeArticle?.checklist || {} )
//   const selected = commonState?.selectionState?.actionName || ''
//   const actionStatus: ActionStatus = nameAndActionStatus[ selected ]
//   const action = actionStatus?.action
//   const hint = action?.hint || ''
//   const variables = commonState?.variables?.Summary?.variables || {}
//   const title = derefence ( 'Title', variables, hint, { variableDefn: dollarsBracesVarDefn, emptyTemplateReturnsSelf: true } )
//   return { knowledgeArticle, action, variables, title, actionName: actionStatus?.actionName };
// }
// export function onClickAction<S, S1 extends CommonState> ( state: LensState<S, S1, any>, actionStatus: ActionStatus ) {
//   return () => state.focusOn ( 'selectionState' ).doubleUp ()
//     .focus1On ( 'workspaceTab' )
//     .focus2On ( 'actionName' )
//     .setJson ( uppercaseFirstLetter ( actionStatus.action.by.toLowerCase () ), actionStatus.actionName, '' )
// }

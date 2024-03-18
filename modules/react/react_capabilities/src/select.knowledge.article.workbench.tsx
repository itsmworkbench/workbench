import { LensProps2, LensState } from "@focuson/state";
import React from "react";
import { DisplayYaml, SelectAndLoadFromUrlStore, SuccessFailContextFn, useTicketType } from "@itsmworkbench/components";
import { IdAnd, splitAndCapitalize } from "@itsmworkbench/utils";
import { TicketType } from "@itsmworkbench/tickettype";
import { SelectKnowledgeArticleWorkBenchContext } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";


//bit hacky... need to clean this up
export interface DisplaySelectKnowledgeArticleWorkbenchProps<S> extends LensProps2<S, Action, IdAnd<TicketType>, any> {
  targetPath: string
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}

export function DisplaySelectKnowledgeArticleWorkbench<S> ( { state, SuccessButton, FailureButton, targetPath }: DisplaySelectKnowledgeArticleWorkbenchProps<S> ) {
  const action: any = (state.optJson1 () || {})
  const appTT = useTicketType ()
  const ticketType: TicketType = action.ticketType || {}
  const actionState = state.state1 () as LensState<S, any, any>

  const contextFn: SuccessFailContextFn = ( tab, phase, action, successOrFail ): SelectKnowledgeArticleWorkBenchContext => ({
    where: { phase, action, tab },
    capability: 'SelectKnowledgeArticle',
    display: {
      title: splitAndCapitalize ( action ),
      type: 'SelectKnowledgeArticle',
      successOrFail,
    },
    data: { ticketType }
  })

  return <>
    {SuccessButton ( contextFn )}
    <SelectAndLoadFromUrlStore basicData={{ organisation: 'me', operator: undefined as any }}
                               namespace='ka'
                               Title={<h1>Knowledge Article</h1>}
                               Summary={ka => <DisplayYaml maxHeight='600px' yaml={ka}/>}
                               targetPath={targetPath}
                               state={state.state2 ()}/>

  </>
}



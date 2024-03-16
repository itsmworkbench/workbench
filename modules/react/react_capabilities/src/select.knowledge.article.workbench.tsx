import { LensProps2, LensState } from "@focuson/state";
import React from "react";
import { DisplayYaml, SelectAndLoadFromUrlStore, SuccessFailContextFn } from "@itsmworkbench/components";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { TicketType } from "@itsmworkbench/tickettype";
import { SelectKnowledgeArticleWorkBenchContext } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";
import { Button } from "@mui/material";


//bit hacky... need to clean this up
export interface DisplaySelectKnowledgeArticleWorkbenchProps<S> extends LensProps2<S, Action, TicketType, any> {
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}

export function DisplaySelectKnowledgeArticleWorkbench<S> ( { state, SuccessButton, FailureButton }: DisplaySelectKnowledgeArticleWorkbenchProps<S> ) {
  const action: any = (state.optJson1 () || {})
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

  function saveClick () {
    //hacking this. the whole workbenches are a mess. Need refactoring, but I want the end to end story to work first
    state.state2 ().setJson ( ticketType, 'saved' )
  }
  return <>
    {SuccessButton ( contextFn )}
    <SelectAndLoadFromUrlStore basicData={{ organisation: 'me', operator: undefined as any }}
                               namespace='ka'
                               Title={<h1>Knowledge Article</h1>}
                               Summary={ka => <DisplayYaml maxHeight='600px' yaml={ka}/>}
                               state={actionState.doubleUp ().focus1On ( 'ticketType' ).focus2On ( 'id' )}/>
    <Button onClick={saveClick}>Save</Button>
  </>
}



import { ISideEffectProcessor, SideEffect } from "@itsmworkbench/react_core";
import { ErrorsAnd } from "@laoban/utils";
import { TicketType } from "@itsmworkbench/tickettype";
import { NamedUrl, UrlSaveFn, UrlStoreResult } from "@itsmworkbench/url";
import { LensProps2 } from "@focuson/state";
import React from "react";
import { Button } from "@mui/material";

//OK Gritting our teeth we aren't worrying about the errors for now. We are just going to assume that everything is going to work.
//This is so that we can test out the happy path of the gui. We want to see what it will look like. We will come back to the errors later.

export interface SaveKnowledgeArticleSideEffect extends SideEffect {
  command: 'saveKa';
  name: string;
  ticketType: TicketType
}
export function isKnowledgeArticleSideEffect ( x: any ): x is SaveKnowledgeArticleSideEffect {
  return x.command === 'saveKa'
}

export interface SaveKnowledgeModelButtonProps<S> extends LensProps2<S, string, SideEffect[], any> {
  ticketType: TicketType
}
export function SaveKnowledgeModelButton<S> ( { state, ticketType }: SaveKnowledgeModelButtonProps<S> ) {
  function onClick () {
    const sk: SaveKnowledgeArticleSideEffect = { command: 'saveKa', name: state.optJson1 () || '', ticketType }
    let seState = state.state2 ();
    const existing = seState.optJson () || []
    seState.setJson ( [ ...existing, sk ], 'save knowledge article' )
  }
  return <Button onClick={onClick} variant="contained" color="primary"> Save KnowledgeModel </Button>

}
export function addSaveKnowledgeArticleSideEffect<S> ( save: UrlSaveFn, organisation: string ): ISideEffectProcessor<S, SaveKnowledgeArticleSideEffect, ErrorsAnd<UrlStoreResult>> {
  return ({
    accept: ( s: SideEffect ): s is SaveKnowledgeArticleSideEffect => isKnowledgeArticleSideEffect ( s ),
    process: async ( s: S, sk: SaveKnowledgeArticleSideEffect ) => {
      const url: NamedUrl = { scheme: 'itsm', organisation, namespace: 'ka', name: sk.name }
      return { result: await save ( url, sk.ticketType ) }
    }
  })
}



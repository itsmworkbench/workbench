import { LensProps2, LensProps3 } from "@focuson/state";
import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { DisplayYaml, FocusedTextInput, mustBeIdentifier, SuccessFailContextFn } from "@itsmworkbench/components";
import { Event } from "@itsmworkbench/events";
import { makeKnowledgeArticle } from "@itsmworkbench/knowledge_articles";
import { TicketType } from "@itsmworkbench/tickettype";
import { SaveKnowledgeArticleButton } from "./save.ka.sideeffect";
import { ErrorsAnd, hasErrors } from "@laoban/utils";
import { SideEffect } from "@itsmworkbench/react_core";

export interface KnowledgeArticleTempData {
  name: string,
  ka: TicketType
}


export interface DisplayKnowledgeArticleWorkbenchProps<S> extends LensProps3<S, KnowledgeArticleTempData, Event[], SideEffect[], any> {
  variables: Record<string, string>
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}

  export function DisplayKnowledgeArticleWorkbench<S> ( { state, SuccessButton, FailureButton, variables }: DisplayKnowledgeArticleWorkbenchProps<S> ) {
    const {} = state.optJson1 () || {}
    const events = state.optJson2 () || []
    const ka: ErrorsAnd<TicketType> = makeKnowledgeArticle ( events, variables )

    let nameState = state.state13 ().focus1On ( 'name' );
    return <Container>
      <Typography variant="h4" gutterBottom>Knowledge Article</Typography>
      <FocusedTextInput errorFn={mustBeIdentifier ( 'Name must be an identifier' )} state={nameState.state1 ()}/>
      {!hasErrors ( ka ) && <SaveKnowledgeArticleButton ticketType={ka} state={nameState}/>}
      <DisplayYaml yaml={ka} maxHeight='500px'/>
    </Container>
  }



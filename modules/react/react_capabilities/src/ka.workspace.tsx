import { LensProps2, LensProps3 } from "@focuson/state";
import React from "react";
import { Box, Container, Tooltip, Typography } from "@mui/material";
import { DisplayYaml, FocusedTextInput, mustBeIdentifier, Status, SuccessFailContextFn, useTicketType, useVariables } from "@itsmworkbench/components";
import { Event } from "@itsmworkbench/events";
import { makeKnowledgeArticle } from "@itsmworkbench/knowledge_articles";
import { TicketType } from "@itsmworkbench/tickettype";
import { SaveKnowledgeArticleButton } from "./save.ka.sideeffect";
import { ErrorsAnd, hasErrors } from "@laoban/utils";
import { SideEffect } from "@itsmworkbench/react_core";
import { DisplayPhasesForTicketType } from "@itsmworkbench/reacttickettype";

export interface KnowledgeArticleTempData {
  name: string,
  ka: TicketType
}


export interface DisplayKnowledgeArticleWorkbenchProps<S> extends LensProps3<S, KnowledgeArticleTempData, Event[], SideEffect[], any> {
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}

export function DisplayKnowledgeArticleWorkbench<S> ( { state, SuccessButton, FailureButton }: DisplayKnowledgeArticleWorkbenchProps<S> ) {
  const {} = state.optJson1 () || {}
  const variables = useVariables ()
  const ticketType = useTicketType ()
  const events = state.optJson2 () || []
  const ka: ErrorsAnd<TicketType> = makeKnowledgeArticle ( events, ticketType, variables )

  let nameState = state.state13 ().focus1On ( 'name' );
  return <Container>
    <Typography variant="h4" gutterBottom>Knowledge Article</Typography>
    <FocusedTextInput errorFn={mustBeIdentifier ( 'Name must be an identifier' )} state={nameState.state1 ()}/>
    {hasErrors ( ka ) && <DisplayYaml yaml={ka} maxHeight='500px'/>}
    {!hasErrors ( ka ) && <><SaveKnowledgeArticleButton ticketType={ka} state={nameState}/>
        <DisplayPhasesForTicketType ticketType={ka} Action={
          ( phase, name, action, status ) =>
            <Tooltip title={JSON.stringify ( action )}>
              <Typography
                component="span"
                variant="body1"
                sx={{
                  textDecoration: "underline",
                  color: "blue",
                  cursor: "pointer",
                  '&:hover': {
                    color: "darkblue",
                  }
                }}
              >
                {name}
              </Typography>
            </Tooltip>
        }/></>}
  </Container>
}



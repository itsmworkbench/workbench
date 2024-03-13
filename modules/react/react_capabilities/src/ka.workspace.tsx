import { LensProps2 } from "@focuson/state";
import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { DisplayYaml, SuccessFailContextFn } from "@itsmworkbench/components";
import { Event } from "@itsmworkbench/events";
import { makeKnowledgeArticle } from "@itsmworkbench/knowledge_articles";

export interface KnowledgeArticleTempData {
}


export interface DisplayKnowledgeArticleWorkbenchProps<S> extends LensProps2<S, KnowledgeArticleTempData, Event[], any> {
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}

export function DisplayKnowledgeArticleWorkbench<S> ( { state, SuccessButton, FailureButton }: DisplayKnowledgeArticleWorkbenchProps<S> ) {
  const {} = state.optJson1 () || {}
  const events = state.optJson2 () || []
  const ka = makeKnowledgeArticle ( events )
  return <Container>
    <Typography variant="h4" gutterBottom>Knowledge Article</Typography>
    <DisplayYaml yaml={ka}/>
  </Container>
}



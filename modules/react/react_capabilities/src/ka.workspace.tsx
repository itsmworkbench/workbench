import { LensProps2, LensProps3 } from "@focuson/state";
import React from "react";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import TestIcon from '@mui/icons-material/SettingsEthernet'; // Example icon for "Test Connection"
import RefreshIcon from '@mui/icons-material/Refresh';
import { DisplayJson, DisplayYaml, SuccessFailContextFn } from "@itsmworkbench/components";
import { TicketType } from "@itsmworkbench/tickettype";
import { Event } from "@itsmworkbench/events";

export interface KnowledgeArticleTempData {
}


export interface DisplayKnowledgeArticleWorkbenchProps<S> extends LensProps2<S, KnowledgeArticleTempData, Event[], any> {
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}

export function DisplayKnowledgeArticleWorkbench<S> ( { state, SuccessButton, FailureButton }: DisplayKnowledgeArticleWorkbenchProps<S> ) {
  const {} = state.optJson1 () || {}
  const events = state.optJson2 () || []
  const ticketTypeEvent = events.find ( ( e: any ) => e.value?.ticketType )
  const phases = (ticketTypeEvent as any)?.value.ticketType?.actions || {}
  const phaseActions = Object.entries ( phases ).map ( ( [ phase, actions ], i ) => {
    const e = events.filter ( ( e: any ) => e.context?.phase === phase )
    return <div key={phase}><Typography variant="h4" gutterBottom>{phase}</Typography>
      <DisplayYaml yaml={actions}/>
      <DisplayJson json={e}/>
    </div>;
  } )

  return <Container>
    <Typography variant="h4" gutterBottom>Knowledge Article</Typography>

    <Box marginBottom={2}>
      <Typography variant="subtitle1" gutterBottom>Phases</Typography>
      <DisplayJson json={phases} maxHeight='200px'/>
      {phaseActions}
      {/*{SuccessButton ( contextFn )}*/}
      {/*{FailureButton ( contextFn )}*/}
    </Box>

  </Container>
}



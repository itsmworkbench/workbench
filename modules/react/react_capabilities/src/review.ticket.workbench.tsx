import { LensProps3, LensState } from "@focuson/state";
import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { DisplayMarkdown, DisplayYaml, FocusedTextArea, SelectAndLoadFromUrlStore, SuccessFailContextFn } from "@itsmworkbench/components";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { ReviewTicketWorkBenchContext } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";
import { Ticket } from "@itsmworkbench/tickets";
import { TicketType } from "@itsmworkbench/tickettype";


export interface DisplayReviewTicketWorkbenchProps<S> extends LensProps3<S, Ticket, Action, TicketType, any> {
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}

export function DisplayReviewTicketWorkbench<S> ( { state, SuccessButton, FailureButton }: DisplayReviewTicketWorkbenchProps<S> ) {
  let actionState: LensState<S, any, any> = state.state2 ();
  let ticket: Ticket = state.state1 ().json ()
  const action: any = (state.optJson2 () || {})
  const locatedAttributes = action.locatedAttributes || {}
  const editedAttributes = action.editedAttributes || ''

  const contextFn: SuccessFailContextFn = ( tab, phase, action, successOrFail ): ReviewTicketWorkBenchContext => ({
    where: { phase, action, tab },
    capability: 'ReviewTicket',
    display: {
      title: splitAndCapitalize ( action ),
      type: 'ReviewTicket',
      successOrFail,
    },
    data: { locatedAttributes, editedAttributes }
  })

  return <Container maxWidth="md">
    <Typography variant="h4" gutterBottom>Review Ticket</Typography>
    <Box marginBottom={2}>
      <Typography variant="subtitle1" gutterBottom>Ticket</Typography>
      <DisplayMarkdown md={ticket.description} maxHeight='500px'/>
      <Typography variant="subtitle1" gutterBottom>Located attributes</Typography>
      <DisplayMarkdown md={locatedAttributes} maxHeight='500px'/>
      <Typography variant="subtitle1" gutterBottom>You can change attributes here</Typography>
      <FocusedTextArea fullWidth rows={10} variant="outlined" state={actionState.focusOn ( 'editedAttributes' )}/>
      <SelectAndLoadFromUrlStore basicData={
        { organisation: 'me', operator: undefined as any }
      }
                                 namespace='ka'
                                 Title={<h1>Knowledge Article</h1>}
                                 Summary={ka => <DisplayYaml yaml={ka}/>}
                                 state={state.state3 ()}/>
      {SuccessButton ( contextFn )}
      {FailureButton ( contextFn )}
    </Box>
  </Container>
}



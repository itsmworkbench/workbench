import { LensProps2, LensProps3, LensState } from "@focuson/state";
import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import TestIcon from '@mui/icons-material/SettingsEthernet'; // Example icon for "Test Connection"
import RefreshIcon from '@mui/icons-material/Refresh';
import { FocusedTextArea, FocusedTextInput, SuccessFailContextFn } from "@itsmworkbench/components";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { ReviewTicketWorkBenchContext } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";
import { Ticket } from "@itsmworkbench/tickets";


export interface DisplayReviewTicketWorkbenchProps<S> extends LensProps3<S, Ticket, Action, any, any> {
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}

export function DisplayReviewTicketWorkbench<S> ( { state, SuccessButton, FailureButton }: DisplayReviewTicketWorkbenchProps<S> ) {
  let actionState: LensState<S, any, any> = state.state1 ();
  let ticket: Ticket = state.state1 ().json ()
  const action: any = state.optJson2 ()
  const email = action?.email || ''
  const response = action?.response || ''
  const variables = state.optJson2 () || {}

  const contextFn: SuccessFailContextFn = ( tab, phase, action, successOrFail ): ReviewTicketWorkBenchContext => ({
    where: { phase, action, tab },
    capability: 'ReviewTicket',
    display: {
      title: splitAndCapitalize ( action ),
      type: 'ReviewTicket',
      successOrFail,
    },
    data: { email: email || '', response: response || '' }
  })

  return <Container maxWidth="md">
    <Typography variant="h4" gutterBottom>Review Ticket</Typography>
    <Box marginBottom={2}>
      <Typography variant="subtitle1" gutterBottom>ticket</Typography>
      <FocusedTextInput fullWidth variant="outlined" state={actionState.focusOn ( 'email' )}/>
      <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>}>Execute </Button>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>}> Test Connection </Button>
        <Button variant="contained" color="primary" endIcon={<RefreshIcon/>}> Reset</Button>
      </Box>
      <Typography variant="subtitle1" gutterBottom>ReviewTicket Result</Typography>
      <FocusedTextArea fullWidth variant="outlined" state={actionState.focusOn ( 'response' )}/>
      {SuccessButton ( contextFn )}
      {FailureButton ( contextFn )}
    </Box>
  </Container>
}



import { LensProps2, LensProps3, LensState } from "@focuson/state";
import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import TestIcon from '@mui/icons-material/SettingsEthernet'; // Example icon for "Test Connection"
import { FocusedTextArea, FocusedTextInput, SuccessFailContextFn } from "@itsmworkbench/components";
import { SideEffect, TabPhaseAndActionSelectionState } from "@itsmworkbench/react_core";
import { Ticket } from "@itsmworkbench/tickets";
import RefreshIcon from "@mui/icons-material/Refresh";
import { AiEmailSideEffect } from "./ai.email.sideeffect";
import { EmailWorkBenchContext } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";


export interface SendTicketForEmailButtonProps<S> extends LensProps3<S, TabPhaseAndActionSelectionState, Ticket, SideEffect[], any> {
}
export function SendTicketForEmailButton<S> ( { state }: SendTicketForEmailButtonProps<S> ) {
  function onClick () {
    const existing = state.optJson3 () ?? []
    const aiEmailSideEffect: AiEmailSideEffect = {
      command: 'aiEmail',
      ticketId: '',
      purpose: state.state1 ().optJson ()?.action as any,
      ticket: state.optJson2 ()?.description ?? ''
    };
    state.state3 ().setJson ( [ ...existing, aiEmailSideEffect ], '' )
  }
  return <Button variant="contained" color="primary" endIcon={<TestIcon/>} onClick={onClick}>Suggest Email </Button>
}


export interface DisplayEmailWorkbenchProps<S> extends LensProps2<S, Action, any, any> {
  SuggestButton: React.ReactNode
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}

export function DisplayEmailWorkbench<S> ( { state, SuggestButton, SuccessButton, FailureButton }: DisplayEmailWorkbenchProps<S> ) {
  const action: any = state.optJson1 ()
  const to = action.to || ''
  const subject = action.subject || ''
  const email = action.email || ''
  const variables = state.optJson2 () || {}

  const contextFn: SuccessFailContextFn = ( tab, phase, action, successOrFail ): EmailWorkBenchContext => ({
    capability: 'Email',
    where: { phase, action, tab },
    display: {
      title: `Sending email [${subject}]`,
      type: 'Email',
      successOrFail
    },
    data: { to, subject, email }
  })

  const actionState: LensState<S, any, any> = state.state1 ();
  return <Container maxWidth="md">
    <Typography variant="h4" gutterBottom>Email</Typography>

    <Box marginBottom={2}>
      <Typography variant="subtitle1" gutterBottom>Send Email To</Typography>
      <FocusedTextInput fullWidth variant="outlined" state={actionState.focusOn ( 'to' )}/>
      <Typography variant="subtitle1" gutterBottom>Subject</Typography>
      <FocusedTextInput fullWidth variant="outlined" state={actionState.focusOn ( 'subject' )}/>

      <Typography variant="subtitle1" gutterBottom>Email</Typography>
      {SuggestButton}
      <FocusedTextArea fullWidth variant="outlined" multiline rows={12} state={actionState.focusOn ( 'email' )}/>
      <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>}>Send Email </Button>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>}> Test Connection </Button>
        <Button variant="contained" color="primary" endIcon={<RefreshIcon/>}> Reset</Button>
      </Box>
      {SuccessButton ( contextFn )}
      {FailureButton ( contextFn )}
    </Box>

  </Container>
}



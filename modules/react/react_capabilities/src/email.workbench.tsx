import { LensProps, LensProps3, LensState } from "@focuson/state";
import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import TestIcon from '@mui/icons-material/SettingsEthernet'; // Example icon for "Test Connection"
import { FocusedTextArea, FocusedTextInput, SuccessFailContextFn, useAiEmail, useEmailFn, useVariables } from "@itsmworkbench/components";
import { TabPhaseAndActionSelectionState } from "@itsmworkbench/react_core";
import RefreshIcon from "@mui/icons-material/Refresh";
import { EmailTempData, EmailWorkBenchContext } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";
import { Ticket } from "@itsmworkbench/tickets";


export interface SuggestEmailForTicketButtonProps<S> extends LensProps3<S, TabPhaseAndActionSelectionState, Ticket, Action, any> {
}
export function SuggestEmailForTicketButton<S> ( { state }: SuggestEmailForTicketButtonProps<S> ) {
  const ai = useAiEmail ()
  const purpose = state.state1 ().optJson ()?.action as any
  const ticket = state.optJson2 ()
  const actionState: LensState<S, any, any> = state.state3 ();
  const action = state.optJson3 ()
  console.log ( 'SuggestEmailForTicketButton - action', action )
  function onClick () {
    if ( ticket === undefined ) return
    ai ( {
      purpose,
      ticketId: ticket.id,
      ticket: ticket.description
    } ).then ( res => {
      console.log ( 'SuggestEmailForTicketButton - stat', state.state2 () )
      console.log ( 'SuggestEmailForTicketButton - result', res )
      actionState.doubleUp ().focus1On ( 'subject' ).focus2On ( 'email' ).setJson (
        res.subject || '',
        res.email || JSON.stringify ( res.error, null, 2 ), '' )
      // state.state3 ().focusOn ( 'description' ).setJson ( res.email || JSON.stringify ( res.error, null, 2 ), '' )
    } )
  }
  if ( ticket === undefined ) return <span>Software error: cannot find the ticket</span>
  return <Button variant="contained" color="primary" endIcon={<TestIcon/>} onClick={onClick}>Suggest Email </Button>
}


export interface DisplayEmailWorkbenchProps<S> extends LensProps<S, Action, any> {
  SuggestButton: React.ReactNode
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}


function SendEmailButton<S> ( { state }: LensProps<S, EmailTempData, any> ) {
  const emailFn = useEmailFn ()
  function onClick () {
    const email = state.optJson ()
    if ( email )
      emailFn ( {
        to: email.to,
        subject: email.subject,
        text: email.email
      } ).then ( response => {
        state.focusOn ( 'response' ).setJson ( JSON.stringify ( response, null, 2 ), '' )
      } )
  }
  return <Button variant="contained" color="primary" onClick={onClick} endIcon={<TestIcon/>}>Send Email </Button>;
}
export function DisplayEmailWorkbench<S> ( { state, SuggestButton, SuccessButton, FailureButton }: DisplayEmailWorkbenchProps<S> ) {
  const action: any = state.optJson ()
  const to = action.to || ''
  const subject = action.subject || ''
  const email = action.email || ''
  const response = action.response
  const variables = useVariables ()

  const contextFn: SuccessFailContextFn = ( tab, phase, action, successOrFail ): EmailWorkBenchContext => ({
    capability: 'Email',
    where: { phase, action, tab },
    display: {
      title: `Sending email [${subject}]`,
      type: 'Email',
      successOrFail
    },
    data: { to, subject, email, response }
  })

  const actionState: LensState<S, any, any> = state;
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
        <SendEmailButton state={actionState}/>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>}> Test Connection </Button>
        <Button variant="contained" color="primary" endIcon={<RefreshIcon/>}> Reset</Button>
      </Box>
      {action.response && <pre>{action.response}</pre>}
      {SuccessButton ( contextFn )}
      {FailureButton ( contextFn )}
    </Box>

  </Container>
}



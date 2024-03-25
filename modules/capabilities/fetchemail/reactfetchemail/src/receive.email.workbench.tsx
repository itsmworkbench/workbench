import { LensProps, LensState } from "@focuson/state";
import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import TestIcon from '@mui/icons-material/SettingsEthernet'; // Example icon for "Test Connection"
import RefreshIcon from '@mui/icons-material/Refresh';
import { DisplayJson, FocusedTextArea, SuccessFailContextFn, SuccessFailureButton, useFetchEmailer } from "@itsmworkbench/components";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { ReceiveEmailWorkbenchContext } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";
import { ActionPlugIn, ActionPluginDetails } from "@itsmworkbench/react_core";
import { FetchEmailer, ListEmailsResult } from "@itsmworkbench/fetchemail";
import { ErrorsAnd } from "@laoban/utils";
import { EmailsTable } from "./received.email.summary";
import { EmailDetails } from "./email.details";


export interface DisplayReceiveEmailWorkbenchProps<S> extends LensProps<S, Action, any> {
}

type TestConnectionButtonProps<S> = LensProps<S, string, any> & {
  fetchEmailer: FetchEmailer
}
function TestConnectionButton<S> ( { fetchEmailer, state }: TestConnectionButtonProps<S> ) {
  function onClick () {
    fetchEmailer.testConnection ().then ( result => state.setJson ( result, '' ) ).catch ( ( e: any ) => {
      console.error ( e )
      state.setJson ( JSON.stringify ( e, null, 2 ), '' )
    } )
  }
  return <Button variant="contained" color="primary" endIcon={<TestIcon/>} onClick={onClick}>Test Connection</Button>;
}
type SearchButtonProps<S> = LensProps<S, ErrorsAnd<ListEmailsResult>, any> & {
  fetchEmailer: FetchEmailer
  from: string
}
function SearchButton<S> ( { fetchEmailer, state, from }: SearchButtonProps<S> ) {
  function onClick () {
    fetchEmailer.listEmails ( { from } ).then ( result => state.setJson ( result, '' ) ).catch ( ( e: any ) => {
      console.error ( e )
      state.setJson ( [ JSON.stringify ( e, null, 2 ) ], '' )
    } )
  }
  return <Button variant="contained" color="primary" endIcon={<TestIcon/>} onClick={onClick}>Search</Button>;
}

export function DisplayReceiveEmailWorkbench<S> ( { state }: DisplayReceiveEmailWorkbenchProps<S> ) {
  const action: any = state.optJson ()
  const email = action?.email || ''
  const from = action?.from || ''
  const emailSummary = action?.emailSummary||{} as any
  const fetchEmailer = useFetchEmailer ()

  const contextFn: SuccessFailContextFn = ( tab, phase, action, successOrFail ): ReceiveEmailWorkbenchContext => ({
    capability: 'ReceiveEmail',
    where: { phase, action, tab },
    display: {
      title: `ReceiveEmail check to ${splitAndCapitalize ( action )}`,
      type: 'ReceiveEmail',
      successOrFail,
    },
    data: { email, from, emailSummary }
  })

  let actionState: LensState<S, any, any> = state;
  return <Container maxWidth="md">
    <Typography variant="h4" gutterBottom>Receive Email</Typography>

    <Box marginBottom={2}>
      <Typography variant="subtitle1" gutterBottom>Received From</Typography>
      <FocusedTextArea state={actionState.focusOn ( 'from' )}/>
      <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
        <SearchButton fetchEmailer={fetchEmailer} state={actionState.focusOn ( 'emailSummary' )} from={from}/>
        <TestConnectionButton fetchEmailer={fetchEmailer} state={actionState.focusOn ( 'email' )}/>
        <Button variant="contained" color="primary" endIcon={<RefreshIcon/>}> Reset</Button>
      </Box>
      <EmailsTable emails={actionState.focusOn ( 'emailSummary' ).optJson ()} state={actionState.focusOn ( 'email' )} maxHeight='800px'/>
      <Typography variant="subtitle1" gutterBottom>Email</Typography>
      <EmailDetails email={actionState.focusOn ( 'email' ).optJson ()}/>
      <SuccessFailureButton title='Email read successfully' successOrFail={true} context={contextFn}/>
    </Box>

  </Container>
}


export const displayReceiveEmailPlugin = <S, State> (): ActionPlugIn<S, State, LensProps<S, Action, any>> =>
  ( props: ( s: LensState<S, State, any> ) => LensProps<S, Action, any> ): ActionPluginDetails<S, State, LensProps<S, Action, any>> =>
    ({
      by: "ReceiveEmailWorkbench",
      props,
      render: ( s, props ) => <DisplayReceiveEmailWorkbench {...props} />
    })
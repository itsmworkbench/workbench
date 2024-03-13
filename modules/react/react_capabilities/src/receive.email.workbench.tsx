import { LensProps2, LensState } from "@focuson/state";
import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import TestIcon from '@mui/icons-material/SettingsEthernet'; // Example icon for "Test Connection"
import RefreshIcon from '@mui/icons-material/Refresh';
import { FocusedTextArea, SuccessFailContextFn } from "@itsmworkbench/components";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { ReceiveEmailWorkbenchContext } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";


export interface DisplayReceiveEmailWorkbenchProps<S> extends LensProps2<S, Action, any, any> {
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}

export function DisplayReceiveEmailWorkbench<S> ( { state, SuccessButton, FailureButton }: DisplayReceiveEmailWorkbenchProps<S> ) {
  const action: any = state.optJson1 ()
  const email = action?.email || ''
  const from = action?.from || ''
  const variables = state.optJson2 () || {}

  const contextFn: SuccessFailContextFn = ( tab, phase, action, successOrFail ): ReceiveEmailWorkbenchContext => ({
    capability: 'ReceiveEmail',
    where: { phase, action, tab },
    display: {
      title: `ReceiveEmail check to ${splitAndCapitalize ( action )}`,
      type: 'ReceiveEmail',
      successOrFail,
    },
    data: { email, from }
  })

  let actionState: LensState<S, any, any>;
  actionState = state.state1 ();
  return <Container maxWidth="md">
    <Typography variant="h4" gutterBottom>Receive Email</Typography>

    <Box marginBottom={2}>
      <Typography variant="subtitle1" gutterBottom>Received From</Typography>
      <FocusedTextArea state={actionState.focusOn ( 'from' )}/>
      <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>}>Execute </Button>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>}> Test Connection </Button>
        <Button variant="contained" color="primary" endIcon={<RefreshIcon/>}> Reset</Button>
      </Box>
      <Typography variant="subtitle1" gutterBottom>Email</Typography>
      <FocusedTextArea state={actionState.focusOn ( 'email' )}/>
      {SuccessButton ( contextFn )}
      {FailureButton ( contextFn )}
    </Box>

  </Container>
}



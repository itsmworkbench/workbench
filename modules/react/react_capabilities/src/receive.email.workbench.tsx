import { LensProps, LensProps2, LensState } from "@focuson/state";
import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import TestIcon from '@mui/icons-material/SettingsEthernet'; // Example icon for "Test Connection"
import RefreshIcon from '@mui/icons-material/Refresh';
import { FocusedTextArea, SuccessFailContextFn, SuccessFailureButton, useVariables } from "@itsmworkbench/components";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { ReceiveEmailWorkbenchContext } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";
import { ActionPlugIn, ActionPluginDetails } from "@itsmworkbench/react_core";


export interface DisplayReceiveEmailWorkbenchProps<S> extends LensProps<S, Action, any> {
}

export function DisplayReceiveEmailWorkbench<S> ( { state }: DisplayReceiveEmailWorkbenchProps<S> ) {
  const action: any = state.optJson ()
  const email = action?.email || ''
  const from = action?.from || ''
  const variables = useVariables ()

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

  let actionState: LensState<S, any, any> = state;
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
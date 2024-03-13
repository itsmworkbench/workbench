import { LensProps2, LensState } from "@focuson/state";
import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import TestIcon from '@mui/icons-material/SettingsEthernet'; // Example icon for "Test Connection"
import RefreshIcon from '@mui/icons-material/Refresh';
import { FocusedTextArea, FocusedTextInput, SuccessFailContextFn } from "@itsmworkbench/components";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { LdapWorkBenchContext } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";


export interface DisplayLdapWorkbenchProps<S> extends LensProps2<S, Action, any, any> {
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}

export function DisplayLdapWorkbench<S> ( { state, SuccessButton, FailureButton }: DisplayLdapWorkbenchProps<S> ) {
  let actionState: LensState<S, any, any> = state.state1 ();
  const action: any = state.optJson1 ()
  const email = action?.email || ''
  const response = action?.response || ''
  const variables = state.optJson2 () || {}

  const contextFn: SuccessFailContextFn = ( tab, phase, action, successOrFail ): LdapWorkBenchContext => ({
    where: { phase, action, tab },
    capability: 'LDAP',
    display: {
      title: `Ldap check to ${splitAndCapitalize ( action )}`,
      type: 'LDAP',
      successOrFail,
    },
    data: { email: email || '', response: response || '' }
  })

  return <Container maxWidth="md">
    <Typography variant="h4" gutterBottom>LDAP Check</Typography>
    <Box marginBottom={2}>
      <Typography variant="subtitle1" gutterBottom>Email to check in LDAP</Typography>
      <FocusedTextInput fullWidth variant="outlined" state={actionState.focusOn ( 'email' )}/>
      <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>}>Execute </Button>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>}> Test Connection </Button>
        <Button variant="contained" color="primary" endIcon={<RefreshIcon/>}> Reset</Button>
      </Box>
      <Typography variant="subtitle1" gutterBottom>LDAP Result</Typography>
      <FocusedTextArea fullWidth variant="outlined" state={actionState.focusOn ( 'response' )}/>
      {SuccessButton ( contextFn )}
      {FailureButton ( contextFn )}
    </Box>
  </Container>
}



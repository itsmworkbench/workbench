import { LensProps2 } from "@focuson/state";
import React from "react";

import { findSqlDataDetails } from "@itsmworkbench/defaultdomains";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import TestIcon from '@mui/icons-material/SettingsEthernet'; // Example icon for "Test Connection"
import RefreshIcon from '@mui/icons-material/Refresh';
import { SqlDataTable } from "./SqlData";
import { SuccessFailContextFn } from "@itsmworkbench/components";
import { splitAndCapitalize } from "@itsmworkbench/utils";

export interface LdapData {
  email: string
  response: string
}


export interface DisplayLdapWorkbenchProps<S> extends LensProps2<S, LdapData, any, any> {
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}

export function DisplayLdapWorkbench<S> ( { state, SuccessButton, FailureButton }: DisplayLdapWorkbenchProps<S> ) {
  const { email, response } = state.optJson1 () || { sql: '', response: '' }
  const variables = state.optJson2 () || {}

  const contextFn: SuccessFailContextFn = ( tab: string | undefined, phase: string, action: string, successOrFail ) => ({
    phase, action,
    display: {
      title: `Ldap check to ${splitAndCapitalize ( action )}`,
      type: 'LDAP',
      successOrFail,
    },
    tab,
    email,
    response
  })


  return <Container maxWidth="md">
    <Typography variant="h4" gutterBottom>LDAP Check</Typography>

    <Box marginBottom={2}>
      <Typography variant="subtitle1" gutterBottom>Email to check in LDAP</Typography>
      <TextField fullWidth variant="outlined" value={email}/>
      <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>}>Execute </Button>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>}> Test Connection </Button>
        <Button variant="contained" color="primary" endIcon={<RefreshIcon/>}> Reset</Button>
      </Box>
      <Typography variant="subtitle1" gutterBottom>LDAP Result</Typography>
      <TextField fullWidth variant="outlined" multiline rows={4}/>
      {SuccessButton ( contextFn )}
      {FailureButton ( contextFn )}
    </Box>

  </Container>
}



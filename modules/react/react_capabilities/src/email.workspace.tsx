import { LensProps2 } from "@focuson/state";
import React from "react";

import { findSqlDataDetails } from "@itsmworkbench/defaultdomains";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import TestIcon from '@mui/icons-material/SettingsEthernet'; // Example icon for "Test Connection"
import RefreshIcon from '@mui/icons-material/Refresh';
import { SqlDataTable } from "./SqlData";
import { SuccessFailContextFn } from "@itsmworkbench/components";
import { splitAndCapitalize } from "@itsmworkbench/utils";

export interface EmailData {
  to: string
  email: string
}


export interface DisplayEmailWorkbenchProps<S> extends LensProps2<S, EmailData, any, any> {
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}

export function DisplayEmailWorkbench<S> ( { state, SuccessButton, FailureButton }: DisplayEmailWorkbenchProps<S> ) {
  const { email, to } = state.optJson1 () || { email: '', to: '' }
  const variables = state.optJson2 () || {}

  const contextFn: SuccessFailContextFn = ( tab: string | undefined, phase: string, action: string, successOrFail ) => ({
    phase, action,
    display: {
      title: `Ending email to ${to} in order to  ${splitAndCapitalize ( action )}`,
      type: 'Email',
      successOrFail,
    },
    tab,
    email,
    to
  })


  return <Container maxWidth="md">
    <Typography variant="h4" gutterBottom>Email Check</Typography>

    <Box marginBottom={2}>
      <Typography variant="subtitle1" gutterBottom>Send Email To</Typography>
      <TextField fullWidth variant="outlined" value={to}/>
      <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>}>Send Email </Button>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>}> Test Connection </Button>
        <Button variant="contained" color="primary" endIcon={<RefreshIcon/>}> Reset</Button>
      </Box>
      <Typography variant="subtitle1" gutterBottom>Email</Typography>
      <TextField fullWidth variant="outlined" multiline rows={16}/>
      {SuccessButton ( contextFn )}
      {FailureButton ( contextFn )}
    </Box>

  </Container>
}



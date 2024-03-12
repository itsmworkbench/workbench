import { LensProps2 } from "@focuson/state";
import React from "react";

import { findSqlDataDetails } from "@itsmworkbench/defaultdomains";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import TestIcon from '@mui/icons-material/SettingsEthernet'; // Example icon for "Test Connection"
import RefreshIcon from '@mui/icons-material/Refresh';
import { SqlDataTable } from "./SqlData";
import { SuccessFailContextFn } from "@itsmworkbench/components";
import { splitAndCapitalize } from "@itsmworkbench/utils";

export interface SqlData {
  sql: string
  response: string
}


export interface DisplaySqlWorkbenchProps<S> extends LensProps2<S, SqlData, any, any> {
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}

export function DisplaySqlWorkbench<S> ( { state, SuccessButton, FailureButton }: DisplaySqlWorkbenchProps<S> ) {
  const { sql, response } = state.optJson1 () || { sql: '', response: '' }
  const variables = state.optJson2 () || {}
  const details = findSqlDataDetails ( sql || '', variables )

  const contextFn: SuccessFailContextFn = ( tab, phase, action, successOrFail ) => ({
    phase, action,
    display: {
      title: `Sql to ${splitAndCapitalize ( action )}`,
      type: 'SQL',
      successOrFail,
    },
    tab,
    sql,
    response
  })


  return <Container >
    <Typography variant="h4" gutterBottom>SQL</Typography>

    <Box marginBottom={2}>
      <Typography variant="subtitle1" gutterBottom>SQL to execute</Typography>
      <TextField fullWidth variant="outlined" value={details?.derefedSql} multiline rows={4}/>
      <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>}>Execute </Button>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>}> Test Connection </Button>
        <Button variant="contained" color="primary" endIcon={<RefreshIcon/>}> Reset</Button>
      </Box>
      <Typography variant="subtitle1" gutterBottom>SQL Result</Typography>
      <TextField fullWidth variant="outlined" multiline rows={4}/>
      {SuccessButton ( contextFn )}
      {FailureButton ( contextFn )}
    </Box>

    <SqlDataTable details={details}/>
  </Container>
}



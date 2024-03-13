import { LensProps2 } from "@focuson/state";
import React from "react";

import { findSqlDataDetails } from "@itsmworkbench/defaultdomains";
import { Box, Button, Container, Typography } from "@mui/material";
import TestIcon from '@mui/icons-material/SettingsEthernet'; // Example icon for "Test Connection"
import RefreshIcon from '@mui/icons-material/Refresh';
import { SqlDataTable } from "./SqlData";
import { FocusedTextArea, SuccessFailContextFn } from "@itsmworkbench/components";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { SqlData, SqlWorkBenchContext } from "@itsmworkbench/domain";



export interface DisplaySqlWorkbenchProps<S> extends LensProps2<S, SqlData, any, any> {
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}

export function DisplaySqlWorkbench<S> ( { state, SuccessButton, FailureButton }: DisplaySqlWorkbenchProps<S> ) {
  const { sql, response } = state.optJson1 () || { sql: '', response: '' }
  const variables = state.optJson2 () || {}
  const details = findSqlDataDetails ( sql || '', variables )

  const contextFn: SuccessFailContextFn = ( tab, phase, action, successOrFail ): SqlWorkBenchContext => ({
    capability: 'SQL',
    where: { phase, action, tab },
    data: { sql, response },
    display: {
      title: `Sql to ${splitAndCapitalize ( action )}`,
      type: 'SQL',
      successOrFail,
    },
  })


  return <Container>
    <Typography variant="h4" gutterBottom>SQL</Typography>

    <Box marginBottom={2}>
      <Typography variant="subtitle1" gutterBottom>SQL to execute</Typography>
      <FocusedTextArea state={state.state1 ().focusOn ( 'sql' )} rows={4}/>
      <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>}>Execute </Button>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>}> Test Connection </Button>
        <Button variant="contained" color="primary" endIcon={<RefreshIcon/>}> Reset</Button>
      </Box>
      <Typography variant="subtitle1" gutterBottom>SQL Result</Typography>
      <FocusedTextArea state={state.state1 ().focusOn ( 'response' )} rows={4}/>
      {SuccessButton ( contextFn )}
      {FailureButton ( contextFn )}
    </Box>

    <SqlDataTable details={details}/>
  </Container>
}



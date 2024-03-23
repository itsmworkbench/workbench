import { LensProps, LensState } from "@focuson/state";
import React from "react";

import { findSqlDataDetails } from "@itsmworkbench/defaultdomains";
import { Box, Button, Container, Typography } from "@mui/material";
import TestIcon from '@mui/icons-material/SettingsEthernet'; // Example icon for "Test Connection"
import RefreshIcon from '@mui/icons-material/Refresh';
import { SqlDataTable } from "./SqlData";
import { FocusedTextArea, SuccessFailContextFn, useVariables } from "@itsmworkbench/components";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { SqlWorkBenchContext } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";
import { useSqler } from "@itsmworkbench/components";


//Note this is an action where as in fact it's really a SQLData
export interface DisplaySqlWorkbenchProps<S> extends LensProps<S, Action, any> {
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}

export function DisplaySqlWorkbench<S> ( { state, SuccessButton, FailureButton }: DisplaySqlWorkbenchProps<S> ) {
  const action: any = state.optJson ()
  const sql = action?.sql || ''
  const response = action?.response || ''
  const variables = useVariables ()
  const details = findSqlDataDetails ( sql || '', variables )
  const sqler = useSqler ()
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

  const actionState: LensState<S, any, any> = state;
  let testOnClick = () => {
    sqler.test ( 'oracle' ).then ( ( res ) => {
      actionState.focusOn ( 'response' ).setJson ( res.toString (), '' )
    } )
  };
  let queryOnClick = () => {
    if ( action?.sql )
      sqler.query ( [ action.sql ], 'oracle' ).then ( ( res ) => {
        actionState.focusOn ( 'response' ).setJson ( JSON.stringify ( res, null, 2 ), '' )
      } )
  };
  return <Container>
    <Typography variant="h4" gutterBottom>SQL</Typography>
    <Box marginBottom={2}>
      <Typography variant="subtitle1" gutterBottom>SQL to execute</Typography>
      <FocusedTextArea state={actionState.focusOn ( 'sql' )} rows={4}/>
      <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>} onClick={queryOnClick}>Execute </Button>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>} onClick={testOnClick}> Test Connection </Button>
        <Button variant="contained" color="primary" endIcon={<RefreshIcon/>}> Reset</Button>
      </Box>
      <Typography variant="subtitle1" gutterBottom>SQL Result</Typography>
      <FocusedTextArea state={actionState.focusOn ( 'response' )} rows={4}/>
      {SuccessButton ( contextFn )}
      {FailureButton ( contextFn )}
    </Box>

    <SqlDataTable details={details}/>
  </Container>
}



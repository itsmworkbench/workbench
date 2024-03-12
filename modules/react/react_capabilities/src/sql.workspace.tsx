import { LensProps2 } from "@focuson/state";
import React from "react";

import { findSqlDataDetails } from "@itsmworkbench/defaultdomains";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import TestIcon from '@mui/icons-material/SettingsEthernet'; // Example icon for "Test Connection"
import RefreshIcon from '@mui/icons-material/Refresh';
import { SqlDataTable } from "@itsmworkbench/react_conversation";

export interface SqlData {
  sql: string
  response: string
}


export function DisplaySqlWorkbench<S> ( { state }: LensProps2<S, SqlData, any, any> ) {
  const { sql, response } = state.optJson1 () || { sql: '', response: '' }
  const variables = state.optJson2 () || {}
  const details = findSqlDataDetails ( sql || '', variables )

  return <Container maxWidth="md">
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
      {/*<Paper style={{ padding: '16px', marginBottom: '16px' }}>*/}
      {/*  {correctWhen && <Typography variant="subtitle1">The result is correct when "{correctWhen.toString ()}"</Typography>}*/}
      {/*</Paper>*/}
      {/*{type && <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>*/}
      {/*    <FakeSendButton state={state} icon={<PlayArrowIcon/>} actionName={actionName} message={`[${type}Sql]`} value={true}>The result is good</FakeSendButton>*/}
      {/*    <FakeSendButton state={state} icon={<PlayArrowIcon/>} actionName={actionName} message={`[${type}Sql]`} value={false}>The result is bad</FakeSendButton>*/}
      {/*    <Button variant="contained" color="secondary" endIcon={<CancelIcon/>}> Cancel </Button>*/}
      {/*</Box>}*/}
      <Typography variant="subtitle1" gutterBottom>SQL Result</Typography>
    </Box>


    <SqlDataTable details={details}/>
  </Container>
}



import { LensProps, LensState } from "@focuson/state";
import React from "react";
import { findSqlDataDetails } from "@itsmworkbench/defaultdomains";
import { Box, Button, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme } from "@mui/material";
import TestIcon from '@mui/icons-material/SettingsEthernet'; // Example icon for "Test Connection"
import RefreshIcon from '@mui/icons-material/Refresh';
import { DisplayJson, FocusedTextArea, MonospaceText, SuccessFailContextFn, SuccessFailureButton, useSqler, useVariables } from "@itsmworkbench/components";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { SqlWorkBenchContext } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";
import { isSqlQueryResult, queryOrUpdate, SqlQueryResult } from "@itsmworkbench/sql";
import { ErrorsAnd, hasErrors } from "@laoban/utils";
import { EnvDropdownWithTooltip } from "./envDropdownWithTooltip";

export type SqlResultTableProps = {
  data: SqlQueryResult
}
function SqlResultTable ( { data }: SqlResultTableProps ) {
  const theme = useTheme (); // Use the theme hook
  const { cols, rows } = data;
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {cols.map ( ( columnName ) => (
              <TableCell
                key={columnName}
                sx={{
                  fontWeight: 'bold',
                  backgroundColor: theme.palette.primary.main, // Use primary color from theme
                  color: theme.palette.primary.contrastText, // Ensure text color contrasts with the background
                  fontSize: '0.875rem', // You can adjust this as needed
                }}
              >
                {columnName}
              </TableCell>
            ) )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map ( ( row, index ) => (
            <TableRow
              key={index}
              sx={{
                '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                '&:nth-of-type(even)': { backgroundColor: theme.palette.background.default },
              }} // Use theme colors for alternating row background
            >
              {cols.map ( ( columnName ) => (
                <TableCell key={`${index}-${columnName}`}>
                  {row[ columnName ]}
                </TableCell>
              ) )}
            </TableRow>
          ) )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
export type SqlResultOrErrorProps = {
  data: ErrorsAnd<SqlQueryResult>
}
export function SqlResultOrError ( { data }: SqlResultOrErrorProps ) {
  if ( isSqlQueryResult ( data ) ) return <SqlResultTable data={data}/>
  if ( typeof data === 'string' ) return <MonospaceText text={data}/>
  if ( hasErrors ( data ) ) return <MonospaceText text={data.join ( '\n' )}/>
  return <DisplayJson json={data}/>
}


//Note this is an action where as in fact it's really a SQLData
export interface DisplaySqlWorkbenchProps<S> extends LensProps<S, Action, any> {
}

export function DisplaySqlWorkbench<S> ( { state }: DisplaySqlWorkbenchProps<S> ) {
  const action: any = state.optJson ()
  const sql = action?.sql || ''
  const response = action?.response || ''
  const env = action?.env
  const variables = useVariables ()
  const details = findSqlDataDetails ( sql || '', variables )
  const sqler = useSqler ()

  const contextFn: SuccessFailContextFn = ( tab, phase, action, successOrFail ): SqlWorkBenchContext => ({
    capability: 'SQL',
    where: { phase, action, tab },
    data: { sql, response, env: env || '' },
    display:
      {
        title: `Sql to ${splitAndCapitalize ( action )}`,
        type:
          'SQL',
        successOrFail,
      }
    ,
  })

  const actionState: LensState<S, any, any> = state;
  let testOnClick = () => {
    sqler.test ( 'oracle' ).then ( ( res ) => {
      actionState.focusOn ( 'response' ).setJson ( res.toString (), '' )
    } )
  };
  let queryOnClick = () => {
    if ( action?.sql && env )
      queryOrUpdate ( sqler, [ action.sql ], env ).then ( ( res ) => {
        actionState.focusOn ( 'response' ).setJson ( res, '' )
      } )
  };
  return <Container>
    <Typography variant="h4" gutterBottom>SQL</Typography>
    <Box marginBottom={2}>
      <Typography variant="subtitle1" gutterBottom>SQL to execute</Typography>
      <EnvDropdownWithTooltip state={actionState.focusOn ( 'env' )}/>
      <FocusedTextArea state={actionState.focusOn ( 'sql' )} rows={4}/>
      <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>} onClick={queryOnClick}>Execute </Button>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>} onClick={testOnClick}> Test Connection </Button>
        <Button variant="contained" color="primary" endIcon={<RefreshIcon/>}> Reset</Button>
      </Box>
      <Typography variant="subtitle1" gutterBottom>SQL Result</Typography>
      <SqlResultOrError data={action.response}/>
      <SuccessFailureButton title='This sql succeeded in the current task' successOrFail={true} context={contextFn}/>
      <SuccessFailureButton title='Failure' successOrFail={false} context={contextFn}/>
    </Box>

  </Container>
}





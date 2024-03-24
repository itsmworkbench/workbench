import { LensProps, LensState } from "@focuson/state";
import React, { useEffect } from "react";
import { findSqlDataDetails } from "@itsmworkbench/defaultdomains";
import { Box, Button, Container, FormControl, InputLabel, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, useTheme } from "@mui/material";
import TestIcon from '@mui/icons-material/SettingsEthernet'; // Example icon for "Test Connection"
import RefreshIcon from '@mui/icons-material/Refresh';
import { SqlDataTable } from "./SqlData";
import { DisplayJson, FocusedTextArea, MonospaceText, SuccessFailContextFn, useSqler, useVariables } from "@itsmworkbench/components";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { SqlWorkBenchContext } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";
import { isSqlQueryResult, SqlQueryResult } from "@itsmworkbench/sql";
import { ErrorsAnd, hasErrors, NameAnd } from "@laoban/utils";
import MenuItem from "@mui/material/MenuItem";
import InfoIcon from '@mui/icons-material/Info';

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
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}

export function DisplaySqlWorkbench<S> ( { state, SuccessButton, FailureButton }: DisplaySqlWorkbenchProps<S> ) {
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
      sqler.query ( [ action.sql ], env ).then ( ( res ) => {
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
      {SuccessButton ( contextFn )}
      {FailureButton ( contextFn )}
    </Box>

  </Container>
}

export interface EnvDropdownWithTooltipProps<S> extends LensProps<S, string, any> {


}
function EnvDropdownWithTooltip<S> ( { state }: EnvDropdownWithTooltipProps<S> ) {
  const sqler = useSqler ()
  const [ envs, setEnvs ] = React.useState<ErrorsAnd<NameAnd<NameAnd<string>>>> ( {} )
  useEffect ( () => {
    sqler.listEnvs ().then ( setEnvs )
  }, [] )


  const selectedValue = state.optJson () || ''
  let envName = state.optJson () || '';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}> {/* Adjust the gap as needed */}
      <FormControl sx={{ width: '100%', minWidth: 120 }} size="small">
        <InputLabel id="env-select-label">Environment</InputLabel>
        <Select
          labelId="env-select-label"
          value={selectedValue}
          onChange={( e ) => state.setJson ( e.target.value, '' )}
          displayEmpty
          inputProps={{ 'aria-label': 'Without label' }}
          sx={{ marginTop: 2 }}
        >
          <MenuItem disabled value="">
            <em>Select an environment</em>
          </MenuItem>
          {Object.keys ( envs ).map ( ( key ) => (
            <MenuItem key={key} value={key} sx={{ padding: 2 }}>{key}</MenuItem>
          ) )}
        </Select>
      </FormControl>
      <Tooltip title={<Typography>{hasErrors ( envs ) ? JSON.stringify ( envs, null, 2 ) : envName ? JSON.stringify ( envs?.[ envName ], null, 2 ) : 'No Environment Selected'}</Typography>} placement="right">
        <InfoIcon/>
      </Tooltip>
    </div>
  );
}




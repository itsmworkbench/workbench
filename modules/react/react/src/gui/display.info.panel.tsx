import { DisplayMarkdown, useTicketTypeVariables, useVariables, useYaml } from "@itsmworkbench/components";
import React from "react";
import { ItsmState } from "../state/itsm.state";
import { LensProps } from "@focuson/state";
import { deepCombineTwoObjects } from "@laoban/utils";
import CopyClipboardButton from "@itsmworkbench/components/dist/src/buttons/copy.clipboard.button";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material"; // Import the error icon

export interface DisplayNameProps {
  name: string
  ttVariables: string[]
  value: any
}
export function DisplayName ( { name, ttVariables, value }: DisplayNameProps ) {
  if ( ttVariables.includes ( name ) )
    return <b>{name}</b>
  return <>{name}</>
}
export function DisplayValue ( { name, value, ttVariables }: DisplayNameProps & { value: any } ) {
  const thisValue = value[ name ]
  if ( ttVariables.includes ( name ) ) if ( thisValue === undefined )
    return <Tooltip title="This is a value that is needed by the knowledge article. You can add it by 'Review Ticket' but perhaps you need to 'Request More Data' from the user">
      <ErrorOutlineIcon color="error" style={{ verticalAlign: 'middle' }}/>
    </Tooltip>
  else
    return <b>{thisValue}</b>;
  else
    return <>{thisValue}</>;
}

export function DisplayInfoVariables<S> ( { state }: LensProps<S, ItsmState, any> ) {
  const variables: any = useVariables ();
  const ticket = state.optJson ()?.forTicket?.ticket;
  const attributes = deepCombineTwoObjects ( ticket?.attributes || {}, variables );
  const ttVariables = useTicketTypeVariables ();
  const names = [ ...new Set ( [ ...ttVariables, ...Object.keys ( attributes ) ] ) ].sort ();
  if ( names.length === 0 ) return <></>
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{
            '& > th': {
              backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold'
            }
          }}>
            <TableCell>Attribute</TableCell>
            <TableCell>Value</TableCell>
            <TableCell></TableCell> {/* Empty header for the actions column */}
          </TableRow>
        </TableHead>
        <TableBody>
          {names.map ( ( name, index ) => (
            <TableRow
              key={name}
              sx={{
                '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' },
                '&:nth-of-type(even)': { backgroundColor: '#e0e0e0' },
              }}
            >
              <TableCell>
                <DisplayName name={name} ttVariables={ttVariables} value={attributes}/>
              </TableCell>
              <TableCell sx={{ wordBreak: 'break-all' }}>
                <DisplayValue name={name} ttVariables={ttVariables} value={attributes}/>
              </TableCell>
              <TableCell>
                {attributes[ name ] !== undefined && <CopyClipboardButton textToCopy={attributes[ name ]}/>}
              </TableCell>
            </TableRow>
          ) )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function DisplayInfoPanel<S> ( { state }: LensProps<S, ItsmState, any> ) {
  const variables: any = useVariables ()
  const yamlCapability = useYaml ()
  const ticket = state.optJson ()?.forTicket?.ticket;
  console.log ( 'DisplayInfoPanel - ticket', ticket )
  const description = ticket?.description || state.optJson ()?.forTicket?.tempData?.newTicket?.ticketDetails
  return <div>
    <DisplayMarkdown md={description}/>
    <DisplayInfoVariables state={state}/>
  </div>
}
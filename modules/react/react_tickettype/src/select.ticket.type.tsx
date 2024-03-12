import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { LensProps } from "@focuson/state";
import Grid from '@mui/material/Grid';
import { ApprovalState, defaultTicketTypeDetails, TicketTypeDetails,TicketTypeName } from "@itsmworkbench/tickettype";

export interface SelectTicketTypeProps<S> extends LensProps<S, TicketTypeDetails, any> {
  readonly? : boolean
}


export function SelectTicketType<S, > ( { state , readonly}: SelectTicketTypeProps<S> ) {
  const ttDetails = state.optJson () || defaultTicketTypeDetails;
  const disabled = readonly === true;
  return <>
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={4}>
        <FormControl fullWidth>
          <InputLabel>Ticket Type</InputLabel>
          <Select
            value={ttDetails.ticketType}
            label="Ticket Type"
            disabled={disabled}
            onChange={event => state.focusOn ( 'ticketType' ).setJson ( event.target.value as TicketTypeName, '' )}
          >
            <MenuItem value="General">General</MenuItem>
            <MenuItem value="Update Database">Update Database</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={4}>
        <FormControl fullWidth>
          <InputLabel>Approval State</InputLabel>
          <Select
            value={ttDetails.approvalState}
            label="Approval State"
            disabled={disabled}
            onChange={event => state.focusOn ( 'approvalState' ).setJson ( event.target.value as ApprovalState, '' )
            }
            // onChange={handleApprovalStateChange}
          >
            <MenuItem value="Pre Approved">Pre Approved</MenuItem>
            <MenuItem value="Needs Approval">Needs Approval</MenuItem>
            <MenuItem value="No Approval Needed">No Approval Needed</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={4}>

        <FormControlLabel
          control={<Checkbox checked={ttDetails.validateInvolvedParties}/>}
          label="Validate Involved Parties"
          disabled={disabled}
          onChange={event => state.focusOn ( 'validateInvolvedParties' ).setJson ( ((event.target) as any).checked, '' )}
        />
      </Grid>
    </Grid>
  </>
}
